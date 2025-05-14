import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import {
  formatDateToString,
  getTaxRateLabel,
  getTaxRateValue,
} from '../../shared/helpers';

import { QuoteService } from '../../api/quote.service';
import { CustomToastService } from '../../shared/services/custom-toast.service';
import { ModalConfirmComponent } from '../../shared/modals/modal-confirm/modal-confirm.component';
import { CustomModalSendQuoteEmailRecipientComponent } from '../../shared/modals/custom-modal-send-quote-email-recipient/custom-modal-send-quote-email-recipient.component';

import { StatusQuote, TypeMessageToast } from '../../enums';
import {
  ICustomDataToModalEmailSendQuote,
  IDataEmailForSendQuote,
  IMarkAndChangeStatus,
  IQuote,
  IQuoteItem,
  ITotals,
} from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DetailQuoteService {
  private dialog = inject(MatDialog);
  private quoteService = inject(QuoteService);
  private customToastService = inject(CustomToastService);

  // Using a Subject to emit when a status quote changed
  private _statusChange$ = new Subject<void>();
  public statusChange$ = this._statusChange$.asObservable();

  // LOADING
  public isSendEmailFromDetailComponentSubmitting = signal<boolean>(false);

  calculateTotalsOnDetail(quoteItems: IQuoteItem[]): ITotals {
    const { subtotal, discounts, iva }: any = quoteItems.reduce(
      (acc, item) => {
        const subtotalLine = item.quantity * item.price; // Price before discount & tax
        const discountLine =
          item.quantity * ((item.price * item.discount) / 100); // Discount amount
        const totalLine = subtotalLine - discountLine;

        const itemIva =
          totalLine * (getTaxRateValue(item.taxRate ?? '08') / 100); // IVA after discount

        return {
          subtotal: acc.subtotal + subtotalLine,
          discounts: acc.discounts + discountLine,
          iva: acc.iva + itemIva,
        };
      },
      { subtotal: 0, discounts: 0, iva: 0 }
    );

    // Calculate total
    const total = subtotal - discounts + iva;

    return {
      iva,
      discounts,
      subtotal,
      total,
    };
  }

  public getTaxRateLabel(code: string): string {
    return getTaxRateLabel(code);
  }

  getStatusBadgeFromQuote(status: string): string {
    let result = 'badge bg-label-light';

    switch (status) {
      case StatusQuote.DRAFT:
        result = 'badge bg-label-light';
        break;
      case StatusQuote.SENT:
        result = 'badge bg-label-primary';
        break;
      case StatusQuote.ACCEPTED:
        result = 'badge bg-label-success';
        break;
      case StatusQuote.DECLINED:
        result = 'badge bg-label-danger';
        break;
      case StatusQuote.INVOICED:
        result = 'badge bg-label-warning';
        break;
      case StatusQuote.REMOVED:
        result = 'badge bg-label-removed';
        break;

      default:
        break;
    }

    return result;
  }

  // DESCRIPTION: user click over "Enviar" button from detail-quote
  displayModalQuoteEmail(quote: IQuote): void {
    const data: ICustomDataToModalEmailSendQuote = {
      clientName: quote.client.name,
      currency: quote.currency,
      terms: quote.terms,
      total: quote.total,
    };

    // Mat Dialog solution
    let dialogRef = this.dialog.open(
      CustomModalSendQuoteEmailRecipientComponent,
      {
        width: '70rem',
        autoFocus: false,
        data: data,
      }
    );

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.isSendEmailFromDetailComponentSubmitting.set(true);

        // user want to send email
        const dataEmail: IDataEmailForSendQuote = JSON.parse(data);
        this.quoteService
          .sendEmail(quote.id, dataEmail)
          .subscribe((resp) => this.processResponse(resp));
      }
    });
  }

  /* MARK AND CHANGE QUOTE STATUS */
  markAsSent(quoteId: number): void {
    this.quoteService
      .markAsSent(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsAccepted(quoteId: number): void {
    this.quoteService
      .markAsAccepted(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsDeclined(quoteId: number): void {
    this.quoteService
      .markAsDeclined(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsInvoiced(quoteId: number): void {
    this.quoteService
      .markAsInvoiced(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }

  undoMarkAsAccepted(quoteId: number): void {
    this.quoteService
      .undoMarkAsAccepted(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  undoMarkAsDeclined(quoteId: number): void {
    this.quoteService
      .undoMarkAsDeclined(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  undoMarkAsInvoiced(quoteId: number): void {
    this.quoteService
      .undoMarkAsInvoiced(quoteId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }

  private generateUpdatedAtProperty(): IMarkAndChangeStatus {
    const data: IMarkAndChangeStatus = {
      updatedAt: formatDateToString(new Date()),
    };

    return data;
  }

  private processResponse(resp: any): void {
    if (resp && resp.msg) {
      this.customToastService.add({
        message: resp.msg,
        type: TypeMessageToast.SUCCESS,
        duration: 5000,
      });

      // Emit an event when status changed
      this._statusChange$.next();
    } else {
      this.customToastService.add({
        message: resp.message,
        type: TypeMessageToast.ERROR,
        duration: 5000,
      });
    }

    this.isSendEmailFromDetailComponentSubmitting.set(false);
  }
  /* END MARK AND CHANGE QUOTE STATUS */

  removeQuote(quote: IQuote): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '60rem',
      height: '20rem',
      autoFocus: false,
      data: `Estás seguro/a de que deseas eliminar esta cotización ${quote.quoteNumber} ?`,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((election: boolean) => {
      if (election) {
        this.quoteService
          .removeOne(quote.id, formatDateToString(new Date()))
          .subscribe(this.processResponse);
      }
    });
  }
}
