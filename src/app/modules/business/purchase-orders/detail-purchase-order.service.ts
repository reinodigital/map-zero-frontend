import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { PurchaseOrderService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import {
  getTaxRateValue,
  getTaxRateLabel,
  formatDateToString,
} from '../../../shared/helpers';

import { CustomModalSendPurchaseOrderEmailRecipientComponent } from '../../../shared/modals/custom-modal-send-purchase-order-email-recipient/custom-modal-send-purchase-order-email-recipient.component';
import { ModalConfirmComponent } from '../../../shared/modals/modal-confirm/modal-confirm.component';

import {
  ICustomDataToModalEmailSendPurchaseOrder,
  IDataEmailForSendPurchaseOrder,
  IMarkAndChangeStatusPurchaseOrder,
  IPurchaseOrder,
  IPurchaseOrderItem,
  ITotals,
} from '../../../interfaces';
import { StatusPurchaseOrder, TypeMessageToast } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class DetailPurchaseOrderService {
  private dialog = inject(MatDialog);
  private purchaseOrderService = inject(PurchaseOrderService);
  private customToastService = inject(CustomToastService);

  // Using a Subject to emit when a status Purchase-Order changed
  private _statusPurchaseOrderChange$ = new Subject<void>();
  public statusPurchaseOrderChange$ =
    this._statusPurchaseOrderChange$.asObservable();

  // LOADING
  public isSendEmailFromDetailComponentSubmitting = signal<boolean>(false);

  public triggerStatusChange(): void {
    this._statusPurchaseOrderChange$.next();
  }

  calculateTotalsOnDetail(purchaseOrderItems: IPurchaseOrderItem[]): ITotals {
    const { subtotal, discounts, iva }: any = purchaseOrderItems.reduce(
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

  getStatusBadgeFromPurchaseOrder(status: string): string {
    let result = 'badge bg-label-light';

    switch (status) {
      case StatusPurchaseOrder.DRAFT:
        result = 'badge bg-label-light';
        break;
      case StatusPurchaseOrder.SENT:
        result = 'badge bg-label-primary';
        break;
      case StatusPurchaseOrder.ACCEPTED:
        result = 'badge bg-label-success';
        break;
      case StatusPurchaseOrder.DECLINED:
        result = 'badge bg-label-danger';
        break;
      case StatusPurchaseOrder.INVOICED:
        result = 'badge bg-label-warning';
        break;
      case StatusPurchaseOrder.REMOVED:
        result = 'badge bg-label-removed';
        break;

      default:
        break;
    }

    return result;
  }

  // DESCRIPTION: user click over "Enviar" button from detail-purchase-order
  displayModalPurchaseOrderEmail(purchaseOrder: IPurchaseOrder): void {
    const data: ICustomDataToModalEmailSendPurchaseOrder = {
      clientName: purchaseOrder.client.name,
      currency: purchaseOrder.currency,
      terms: purchaseOrder.terms,
      total: purchaseOrder.total,
    };

    // Mat Dialog solution
    let dialogRef = this.dialog.open(
      CustomModalSendPurchaseOrderEmailRecipientComponent,
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
        const dataEmail: IDataEmailForSendPurchaseOrder = JSON.parse(data);
        this.purchaseOrderService
          .sendEmail(purchaseOrder.id, dataEmail)
          .subscribe((resp) => this.processResponse(resp));
      }
    });
  }

  /* MARK AND CHANGE PURCHASE-ORDER STATUS */
  markAsSent(purchaseOrderId: number): void {
    this.purchaseOrderService
      .markAsSent(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsAccepted(purchaseOrderId: number): void {
    this.purchaseOrderService
      .markAsAccepted(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsDeclined(purchaseOrderId: number): void {
    this.purchaseOrderService
      .markAsDeclined(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  markAsInvoiced(purchaseOrderId: number): void {
    this.purchaseOrderService
      .markAsInvoiced(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }

  undoMarkAsAccepted(purchaseOrderId: number): void {
    this.purchaseOrderService
      .undoMarkAsAccepted(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  undoMarkAsDeclined(purchaseOrderId: number): void {
    this.purchaseOrderService
      .undoMarkAsDeclined(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }
  undoMarkAsInvoiced(purchaseOrderId: number): void {
    this.purchaseOrderService
      .undoMarkAsInvoiced(purchaseOrderId, this.generateUpdatedAtProperty())
      .subscribe((resp) => this.processResponse(resp));
  }

  private generateUpdatedAtProperty(): IMarkAndChangeStatusPurchaseOrder {
    const data: IMarkAndChangeStatusPurchaseOrder = {
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
      this.triggerStatusChange();
    } else {
      this.customToastService.add({
        message: resp.message,
        type: TypeMessageToast.ERROR,
        duration: 5000,
      });
    }

    this.isSendEmailFromDetailComponentSubmitting.set(false);
  }
  /* END MARK AND CHANGE PURCHASE-ORDER STATUS */

  // createInvoiceFromPurchaseOrder(purchaseOrder: IPurchaseOrder): void {
  //   if (purchaseOrder.status !== StatusPurchaseOrder.ACCEPTED) return;

  //   // Mat Dialog solution
  //   let dialogRef = this.dialog.open(
  //     ModalCreateInvoiceFromPurchaseOrderComponent,
  //     {
  //       width: '32rem',
  //       autoFocus: false,
  //       data: purchaseOrder,
  //     }
  //   );

  //   dialogRef.updatePosition({ top: '100px' });
  // }

  removePurchaseOrder(purchaseOrder: IPurchaseOrder): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '60rem',
      height: '20rem',
      autoFocus: false,
      data: `Estás seguro/a de que deseas eliminar esta orden de compra ${purchaseOrder.purchaseOrderNumber} ?`,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((election: boolean) => {
      if (election) {
        this.purchaseOrderService
          .removeOne(purchaseOrder.id, formatDateToString(new Date()))
          .subscribe((resp) => this.processResponse(resp));
      }
    });
  }
}
