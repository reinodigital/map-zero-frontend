import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { InvoiceService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import {
  getTaxRateValue,
  getTaxRateLabel,
  formatDateToString,
} from '../../../shared/helpers';
import { ModalConfirmComponent } from '../../../shared/modals/modal-confirm/modal-confirm.component';

import {
  IInvoice,
  IInvoiceItem,
  IMarkAndChangeStatus,
  ITotals,
} from '../../../interfaces';
import { StatusInvoice, TypeMessageToast } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class DetailInvoiceService {
  private dialog = inject(MatDialog);
  private invoiceService = inject(InvoiceService);
  private customToastService = inject(CustomToastService);

  // Using a Subject to emit when a status quote changed
  private _statusChange$ = new Subject<void>();
  public statusChange$ = this._statusChange$.asObservable();

  // LOADING
  public isSendEmailFromDetailComponentSubmitting = signal<boolean>(false);

  calculateTotalsOnDetail(invoiceItems: IInvoiceItem[]): ITotals {
    const { subtotal, discounts, iva }: any = invoiceItems.reduce(
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

  getStatusBadgeFromInvoice(status: string): string {
    let result = 'badge bg-label-light';

    switch (status) {
      case StatusInvoice.DRAFT:
        result = 'badge bg-label-light';
        break;
      case StatusInvoice.SENT:
        result = 'badge bg-label-primary';
        break;
      // case StatusInvoice.ACCEPTED:
      //   result = 'badge bg-label-success';
      //   break;
      // case StatusInvoice.DECLINED:
      //   result = 'badge bg-label-danger';
      //   break;
      // case StatusInvoice.INVOICED:
      //   result = 'badge bg-label-warning';
      //   break;
      case StatusInvoice.REMOVED:
        result = 'badge bg-label-removed';
        break;

      default:
        break;
    }

    return result;
  }

  // DESCRIPTION: user click over "Enviar" button from detail-invoice
  // displayModalInvoiceEmail(invoice: IQuote): void {
  //   const data: ICustomDataToModalEmailSendQuote = {
  //     clientName: invoice.client.name,
  //     currency: invoice.currency,
  //     terms: invoice.terms,
  //     total: invoice.total,
  //   };

  //   // Mat Dialog solution
  //   let dialogRef = this.dialog.open(
  //     CustomModalSendQuoteEmailRecipientComponent,
  //     {
  //       width: '70rem',
  //       autoFocus: false,
  //       data: data,
  //     }
  //   );

  //   dialogRef.updatePosition({ top: '100px' });
  //   dialogRef.afterClosed().subscribe((data) => {
  //     if (data) {
  //       this.isSendEmailFromDetailComponentSubmitting.set(true);

  //       // user want to send email
  //       const dataEmail: IDataEmailForSendInvoice = JSON.parse(data);
  //       this.invoiceService
  //         .sendEmail(invoice.id, dataEmail)
  //         .subscribe((resp) => this.processResponse(resp));
  //     }
  //   });
  // }

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

  removeInvoice(invoice: IInvoice): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '60rem',
      height: '20rem',
      autoFocus: false,
      data: `Estás seguro/a de que deseas eliminar esta factura ${invoice.invoiceNumber} ?`,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((election: boolean) => {
      if (election) {
        this.invoiceService
          .removeOne(invoice.id, formatDateToString(new Date()))
          .subscribe((resp) => this.processResponse(resp));
      }
    });
  }
}
