import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { PurchaseOrderService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import { getTaxRateValue } from '../../../shared/helpers';

import { CustomModalSendPurchaseOrderEmailRecipientComponent } from '../../../shared/modals/custom-modal-send-purchase-order-email-recipient/custom-modal-send-purchase-order-email-recipient.component';
import { roundToTwoDecimals } from '../../../shared/helpers/round-two-decimals.helper';

import {
  EditPurchaseOrderFormAction,
  NewPurchaseOrderFormAction,
  TypeMessageToast,
} from '../../../enums';
import {
  IItemSuggestion,
  IDataToCreatePurchaseOrder,
  IDataToUpdatePurchaseOrder,
  ICustomDataToModalEmailSendPurchaseOrder,
  IDataEmailForSendPurchaseOrder,
  IPurchaseOrder,
} from '../../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class FormNewPurchaseOrderService {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private customToastService = inject(CustomToastService);
  private purchaseOrderService = inject(PurchaseOrderService);

  // FORM
  public isFormSubmitting = signal<boolean>(false);
  public isFormNewPurchaseOrderAndEmailSubmitting = signal<boolean>(false);

  // ACTIONS
  public saveAction = NewPurchaseOrderFormAction.SAVE;
  public sendAction = NewPurchaseOrderFormAction.SEND;
  public markAsSentAction = NewPurchaseOrderFormAction.MARK_AS_SENT;
  public editAction = EditPurchaseOrderFormAction.EDIT;
  public editAndSendAction = EditPurchaseOrderFormAction.EDIT_AND_SEND;

  // TOTALS
  public subtotal = signal<number>(0);
  public totalDiscount = signal<number>(0);
  public totalTax = signal<number>(0);
  public totalAmount = signal<number>(0);

  public cleanTotalValues(): void {
    this.subtotal.set(0);
    this.totalDiscount.set(0);
    this.totalTax.set(0);
    this.totalAmount.set(0);
  }

  public calculateTotals(purchaseOrderItems: FormArray): void {
    // subtotal
    const subtotal = purchaseOrderItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return sum + quantity * roundToTwoDecimals(price);
    }, 0);

    // total discount
    const totalDiscount = purchaseOrderItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const roundedPrice = roundToTwoDecimals(price);
      const discount = control.get('discount')?.value || 0;
      const discountAmount = (quantity * roundedPrice * discount) / 100;
      return sum + discountAmount;
    }, 0);

    // pre tax total
    const preTaxTotal =
      roundToTwoDecimals(subtotal) - roundToTwoDecimals(totalDiscount);

    // total tax amount
    let totalTaxAmount = 0;
    purchaseOrderItems.controls.forEach((control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const roundedPrice = roundToTwoDecimals(price);
      const discount = control.get('discount')?.value || 0;
      const discountAmount = (quantity * roundedPrice * discount) / 100;

      const taxRateCode = control.get('taxRate')?.value || '08';
      const taxableAmount = quantity * roundedPrice - discountAmount;
      totalTaxAmount += (taxableAmount * getTaxRateValue(taxRateCode)) / 100;
    });

    this.subtotal.set(roundToTwoDecimals(subtotal));
    this.totalDiscount.set(roundToTwoDecimals(totalDiscount));
    this.totalTax.set(roundToTwoDecimals(totalTaxAmount));

    // total
    this.totalAmount.set(roundToTwoDecimals(preTaxTotal + totalTaxAmount));
  }

  public verifyPurchaseOrderItems(purchaseOrderItems: FormArray): boolean {
    return purchaseOrderItems.controls.every((control) =>
      this.isPurchaseOrderItemValid(control as FormGroup)
    );
  }

  private isPurchaseOrderItemValid(group: FormGroup): boolean {
    const quantity = group.get('quantity')?.value;
    const price = group.get('price')?.value;
    const itemId = group.get('itemId')?.value;

    return quantity >= 1 && price > 0 && !!itemId;
  }

  // ========= Actions Submit ============
  public onSaveAction(data: IDataToCreatePurchaseOrder): void {
    this.isFormSubmitting.set(true);
    this.purchaseOrderService.create(data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Orden de Compra generada con estado ${resp.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });

        this.router.navigateByUrl(`/detail-purchase-order/${resp.id}`);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 5000,
        });
      }

      this.isFormSubmitting.set(false);
    });
  }

  public onEditAction(
    purchaseOrderId: number,
    data: IDataToUpdatePurchaseOrder
  ): void {
    this.isFormSubmitting.set(true);
    this.purchaseOrderService
      .update(purchaseOrderId, data)
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.customToastService.add({
            message: `Orden de Compra actualizada correctamente.`,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });

          this.router.navigateByUrl(`/detail-purchase-order/${resp.id}`);
        } else {
          this.customToastService.add({
            message: resp.message,
            type: TypeMessageToast.ERROR,
            duration: 5000,
          });
        }

        this.isFormSubmitting.set(false);
      });
  }

  // STEP 1 display modal and get data email
  handleCreateOrEditPurchaseOrderSendingEmailAsWell(
    purchaseOrder: IDataToCreatePurchaseOrder | IDataToUpdatePurchaseOrder,
    purchaseOrderId: number | null = null
  ) {
    const data: ICustomDataToModalEmailSendPurchaseOrder = {
      clientName: purchaseOrder.client.name,
      currency: purchaseOrder.currency,
      terms: purchaseOrder.terms,
      total: this.totalAmount(),
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
    dialogRef.afterClosed().subscribe((dataEmail) => {
      if (dataEmail) {
        purchaseOrderId
          ? this.onEditPurchaseOrderSendingEmail(
              purchaseOrderId,
              purchaseOrder as IDataToUpdatePurchaseOrder,
              JSON.parse(dataEmail)
            )
          : this.onCreateNewPurchaseOrderSendingEmail(
              purchaseOrder as IDataToCreatePurchaseOrder,
              JSON.parse(dataEmail)
            );
      }
    });
  }

  // STEP 2 CREATE new Purchase-Order sending email
  onCreateNewPurchaseOrderSendingEmail(
    data: IDataToCreatePurchaseOrder,
    dataEmail: IDataEmailForSendPurchaseOrder
  ): void {
    this.purchaseOrderService.create(data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Orden de Compra generada con estado ${data.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 8000,
        });

        // SEND PURCHASE-ORDER EMAIL TO CLIENT
        this.sendPurchaseOrderEmail(resp.id, dataEmail);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 8000,
        });
      }
    });
  }

  // STEP 2 EDIT Purchase-Order sending email
  onEditPurchaseOrderSendingEmail(
    purchaseOrderId: number,
    data: IDataToUpdatePurchaseOrder,
    dataEmail: IDataEmailForSendPurchaseOrder
  ): void {
    this.purchaseOrderService
      .update(purchaseOrderId, data)
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.customToastService.add({
            message: `Orden de Compra actualizada correctamente.`,
            type: TypeMessageToast.SUCCESS,
            duration: 8000,
          });

          // SEND PURCHASE-ORDER EMAIL TO CLIENT
          this.sendPurchaseOrderEmail(resp.id, dataEmail);
        } else {
          this.customToastService.add({
            message: resp.message,
            type: TypeMessageToast.ERROR,
            duration: 8000,
          });
        }
      });
  }

  // STEP 3 after create new purchase-order and being selected send action
  sendPurchaseOrderEmail(
    purchaseOrderId: number,
    data: IDataEmailForSendPurchaseOrder
  ) {
    this.isFormNewPurchaseOrderAndEmailSubmitting.set(true);

    this.purchaseOrderService
      .sendEmail(purchaseOrderId, data)
      .subscribe((resp) => {
        if (resp && resp.msg) {
          this.customToastService.add({
            message: resp.msg,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });
        } else {
          this.customToastService.add({
            message: resp.message,
            type: TypeMessageToast.ERROR,
            duration: 5000,
          });
        }

        this.isFormNewPurchaseOrderAndEmailSubmitting.set(false);
        this.router.navigateByUrl('/detail-purchase-order/' + purchaseOrderId);
      });
  }

  // verify if item emitted is loading an existing one
  getCorrectPriceFromItemSelectedEmitter(
    purchaseOrder: IPurchaseOrder | null,
    item: IItemSuggestion
  ): number {
    const purchaseOrderItem = purchaseOrder?.purchaseOrderItems.find(
      (purchaseOrderItem) => purchaseOrderItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return purchaseOrderItem?.price ?? 0;
    }

    return item.salePrice;
  }

  getCorrectAccountFromItemSelectedEmitter(
    purchaseOrder: IPurchaseOrder | null,
    item: IItemSuggestion
  ): number | string {
    const purchaseOrderItem = purchaseOrder?.purchaseOrderItems.find(
      (purchaseOrderItem) => purchaseOrderItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return purchaseOrderItem?.account?.id ?? '';
    }

    return item.saleAccountId ?? '';
  }

  getCorrectDescriptionFromItemSelectedEmitter(
    purchaseOrder: IPurchaseOrder | null,
    item: IItemSuggestion
  ): string {
    const purchaseOrderItem = purchaseOrder?.purchaseOrderItems.find(
      (purchaseOrderItem) => purchaseOrderItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return purchaseOrderItem?.description ?? '';
    }

    return item.description ?? '';
  }
}
