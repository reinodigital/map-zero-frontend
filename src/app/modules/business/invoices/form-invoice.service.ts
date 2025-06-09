import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { InvoiceService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import { getTaxRateValue } from '../../../shared/helpers';
import { roundToTwoDecimals } from '../../../shared/helpers/round-two-decimals.helper';

import {
  EditInvoiceFormAction,
  InvoiceFormAction,
  TypeMessageToast,
} from '../../../enums';
import {
  IItemSuggestion,
  IDataToUpdateInvoice,
  IDataToCreateInvoice,
  IDataEmailForSendInvoice,
  IInvoice,
} from '../../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class FormInvoiceService {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private customToastService = inject(CustomToastService);
  private invoiceService = inject(InvoiceService);

  // FORM
  public isFormSubmitting = signal<boolean>(false);
  public isFormInvoiceAndEmailSubmitting = signal<boolean>(false);

  // ACTIONS
  public saveAction = InvoiceFormAction.SAVE;
  public sendAction = InvoiceFormAction.SEND;
  public markAsSentAction = InvoiceFormAction.MARK_AS_SENT;
  public editAction = EditInvoiceFormAction.EDIT;
  public editAndSendAction = EditInvoiceFormAction.EDIT_AND_SEND;

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

  public calculateTotals(invoiceItems: FormArray): void {
    // subtotal
    const subtotal = invoiceItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return sum + quantity * roundToTwoDecimals(price);
    }, 0);

    // total discount
    const totalDiscount = invoiceItems.controls.reduce((sum, control) => {
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
    invoiceItems.controls.forEach((control) => {
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

  public verifyInvoiceItems(invoiceItems: FormArray): boolean {
    return invoiceItems.controls.every((control) =>
      this.isInvoiceItemValid(control as FormGroup)
    );
  }

  private isInvoiceItemValid(group: FormGroup): boolean {
    const quantity = group.get('quantity')?.value;
    const price = group.get('price')?.value;
    const itemId = group.get('itemId')?.value;

    return quantity >= 1 && price > 0 && !!itemId;
  }

  // ========= Actions Submit ============
  public onSaveAction(data: IDataToCreateInvoice): void {
    this.isFormSubmitting.set(true);
    this.invoiceService.create(data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Factura generada con estado ${resp.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });

        this.router.navigateByUrl(`/detail-invoice/${resp.id}`);
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

  public onEditAction(invoiceId: number, data: IDataToUpdateInvoice): void {
    this.isFormSubmitting.set(true);
    this.invoiceService.update(invoiceId, data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Factura actualizada correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });

        this.router.navigateByUrl(`/detail-invoice/${resp.id}`);
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
  handleCreateOrEditInvoiceSendingEmailAsWell(
    invoice: IDataToCreateInvoice | IDataToUpdateInvoice,
    invoiceId: number | null = null
  ) {
    // const data: ICustomDataToModalEmailSendInvoice = {
    //   clientName: invoice.client.name,
    //   currency: invoice.currency,
    //   total: this.totalAmount(),
    // };
    // // Mat Dialog solution
    // let dialogRef = this.dialog.open(
    //   CustomModalSendInvoiceEmailRecipientComponent,
    //   {
    //     width: '70rem',
    //     autoFocus: false,
    //     data: data,
    //   }
    // );
    // dialogRef.updatePosition({ top: '100px' });
    // dialogRef.afterClosed().subscribe((dataEmail) => {
    //   if (dataEmail) {
    //     invoiceId
    //       ? this.onEditInvoiceSendingEmail(
    //           invoiceId,
    //           invoice as IDataToUpdateInvoice,
    //           JSON.parse(dataEmail)
    //         )
    //       : this.onCreateNewInvoiceSendingEmail(
    //           invoice as IDataToCreateInvoice,
    //           JSON.parse(dataEmail)
    //         );
    //   }
    // });
  }

  // STEP 2 CREATE new invoice sending email
  onCreateNewInvoiceSendingEmail(
    data: IDataToCreateInvoice,
    dataEmail: IDataEmailForSendInvoice
  ): void {
    // this.invoiceService.create(data).subscribe((resp) => {
    //   if (resp && resp.id) {
    //     this.customToastService.add({
    //       message: `Factura generada con estado ${data.status} correctamente.`,
    //       type: TypeMessageToast.SUCCESS,
    //       duration: 8000,
    //     });
    //     // SEND INVOICE EMAIL TO CLIENT
    //     this.sendInvoiceEmail(resp.id, dataEmail);
    //   } else {
    //     this.customToastService.add({
    //       message: resp.message,
    //       type: TypeMessageToast.ERROR,
    //       duration: 8000,
    //     });
    //   }
    // });
  }

  // STEP 2 EDIT invoice sending email
  onEditInvoiceSendingEmail(
    invoiceId: number,
    data: IDataToUpdateInvoice,
    dataEmail: IDataEmailForSendInvoice
  ): void {
    // this.invoiceService.update(invoiceId, data).subscribe((resp) => {
    //   if (resp && resp.id) {
    //     this.customToastService.add({
    //       message: `Cotización actualizada correctamente.`,
    //       type: TypeMessageToast.SUCCESS,
    //       duration: 8000,
    //     });
    //     // SEND INVOICE EMAIL TO CLIENT
    //     this.sendInvoiceEmail(resp.id, dataEmail);
    //   } else {
    //     this.customToastService.add({
    //       message: resp.message,
    //       type: TypeMessageToast.ERROR,
    //       duration: 8000,
    //     });
    //   }
    // });
  }

  // STEP 3 after create new invoice and being selected send action
  sendInvoiceEmail(invoiceId: number, data: IDataEmailForSendInvoice) {
    // this.isFormInvoiceAndEmailSubmitting.set(true);
    // this.invoiceService.sendEmail(invoiceId, data).subscribe((resp) => {
    //   if (resp && resp.msg) {
    //     this.customToastService.add({
    //       message: resp.msg,
    //       type: TypeMessageToast.SUCCESS,
    //       duration: 5000,
    //     });
    //   } else {
    //     this.customToastService.add({
    //       message: resp.message,
    //       type: TypeMessageToast.ERROR,
    //       duration: 5000,
    //     });
    //   }
    //   this.isFormInvoiceAndEmailSubmitting.set(false);
    //   this.router.navigateByUrl('/detail-invoice/' + invoiceId);
    // });
  }

  // verify if item emitted is loading an existing one
  getCorrectPriceFromItemSelectedEmitter(
    invoice: IInvoice | null,
    item: IItemSuggestion
  ): number {
    const invoiceItem = invoice?.invoiceItems.find(
      (invoiceItem) => invoiceItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return invoiceItem?.price ?? 0;
    }

    return item.salePrice;
  }

  getCorrectAccountFromItemSelectedEmitter(
    invoice: IInvoice | null,
    item: IItemSuggestion
  ): number | string {
    const invoiceItem = invoice?.invoiceItems.find(
      (invoiceItem) => invoiceItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return invoiceItem?.account?.id ?? '';
    }

    return item.saleAccountId ?? '';
  }

  getCorrectDescriptionFromItemSelectedEmitter(
    invoice: IInvoice | null,
    item: IItemSuggestion
  ): string {
    const invoiceItem = invoice?.invoiceItems.find(
      (invoiceItem) => invoiceItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return invoiceItem?.description ?? '';
    }

    return item.description ?? '';
  }
}
