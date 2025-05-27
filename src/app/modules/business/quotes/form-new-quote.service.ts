import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { QuoteService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import { getTaxRateValue } from '../../../shared/helpers';
import { CustomModalSendQuoteEmailRecipientComponent } from '../../../shared/modals/custom-modal-send-quote-email-recipient/custom-modal-send-quote-email-recipient.component';
import { roundToTwoDecimals } from '../../../shared/helpers/round-two-decimals.helper';

import {
  EditQuoteFormAction,
  NewQuoteFormAction,
  TypeMessageToast,
} from '../../../enums';
import {
  IDataToCreateQuote,
  ICustomDataToModalEmailSendQuote,
  IDataEmailForSendQuote,
  IDataToUpdateQuote,
  IItemSuggestion,
  IQuote,
} from '../../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class FormNewQuoteService {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private customToastService = inject(CustomToastService);
  private quoteService = inject(QuoteService);

  // FORM
  public isFormSubmitting = signal<boolean>(false);
  public isFormNewQuoteAndEmailSubmitting = signal<boolean>(false);

  // ACTIONS
  public saveAction = NewQuoteFormAction.SAVE;
  public sendAction = NewQuoteFormAction.SEND;
  public markAsSentAction = NewQuoteFormAction.MARK_AS_SENT;
  public editAction = EditQuoteFormAction.EDIT;
  public editAndSendAction = EditQuoteFormAction.EDIT_AND_SEND;

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

  public calculateTotals(quoteItems: FormArray): void {
    // subtotal
    const subtotal = quoteItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return sum + quantity * roundToTwoDecimals(price);
    }, 0);

    // total discount
    const totalDiscount = quoteItems.controls.reduce((sum, control) => {
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
    quoteItems.controls.forEach((control) => {
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

  public verifyQuoteItems(quoteItems: FormArray): boolean {
    return quoteItems.controls.every((control) =>
      this.isQuoteItemValid(control as FormGroup)
    );
  }

  private isQuoteItemValid(group: FormGroup): boolean {
    const quantity = group.get('quantity')?.value;
    const price = group.get('price')?.value;
    const itemId = group.get('itemId')?.value;

    return quantity >= 1 && price > 0 && !!itemId;
  }

  // ========= Actions Submit ============
  public onSaveAction(data: IDataToCreateQuote): void {
    this.isFormSubmitting.set(true);
    this.quoteService.create(data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización generada con estado ${resp.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });

        this.router.navigateByUrl(`/detail-quote/${resp.id}`);
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

  public onEditAction(quoteId: number, data: IDataToUpdateQuote): void {
    this.isFormSubmitting.set(true);
    this.quoteService.update(quoteId, data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización actualizada correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });

        this.router.navigateByUrl(`/detail-quote/${resp.id}`);
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
  handleCreateOrEditQuoteSendingEmailAsWell(
    quote: IDataToCreateQuote | IDataToUpdateQuote,
    quoteId: number | null = null
  ) {
    const data: ICustomDataToModalEmailSendQuote = {
      clientName: quote.client.name,
      currency: quote.currency,
      terms: quote.terms,
      total: this.totalAmount(),
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
    dialogRef.afterClosed().subscribe((dataEmail) => {
      if (dataEmail) {
        quoteId
          ? this.onEditQuoteSendingEmail(
              quoteId,
              quote as IDataToUpdateQuote,
              JSON.parse(dataEmail)
            )
          : this.onCreateNewQuoteSendingEmail(
              quote as IDataToCreateQuote,
              JSON.parse(dataEmail)
            );
      }
    });
  }

  // STEP 2 CREATE new quote sending email
  onCreateNewQuoteSendingEmail(
    data: IDataToCreateQuote,
    dataEmail: IDataEmailForSendQuote
  ): void {
    this.quoteService.create(data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización generada con estado ${data.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 8000,
        });

        // SEND QUOTE EMAIL TO CLIENT
        this.sendQuoteEmail(resp.id, dataEmail);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 8000,
        });
      }
    });
  }

  // STEP 2 EDIT quote sending email
  onEditQuoteSendingEmail(
    quoteId: number,
    data: IDataToUpdateQuote,
    dataEmail: IDataEmailForSendQuote
  ): void {
    this.quoteService.update(quoteId, data).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización actualizada correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 8000,
        });

        // SEND QUOTE EMAIL TO CLIENT
        this.sendQuoteEmail(resp.id, dataEmail);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 8000,
        });
      }
    });
  }

  // STEP 3 after create new quote and being selected send action
  sendQuoteEmail(quoteId: number, data: IDataEmailForSendQuote) {
    this.isFormNewQuoteAndEmailSubmitting.set(true);

    this.quoteService.sendEmail(quoteId, data).subscribe((resp) => {
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

      this.isFormNewQuoteAndEmailSubmitting.set(false);
      this.router.navigateByUrl('/detail-quote/' + quoteId);
    });
  }

  // verify if item emitted is loading an existing one
  getCorrectPriceFromItemSelectedEmitter(
    quote: IQuote | null,
    item: IItemSuggestion
  ): number {
    const quoteItem = quote?.quoteItems.find(
      (quoteItem) => quoteItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return quoteItem?.price ?? 0;
    }

    return item.salePrice;
  }

  getCorrectAccountFromItemSelectedEmitter(
    quote: IQuote | null,
    item: IItemSuggestion
  ): number | string {
    const quoteItem = quote?.quoteItems.find(
      (quoteItem) => quoteItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return quoteItem?.account?.id ?? '';
    }

    return item.saleAccountId ?? '';
  }

  getCorrectDescriptionFromItemSelectedEmitter(
    quote: IQuote | null,
    item: IItemSuggestion
  ): string {
    const quoteItem = quote?.quoteItems.find(
      (quoteItem) => quoteItem.item.id === item.id
    );

    if (item.isLoadingExistingItem) {
      return quoteItem?.description ?? '';
    }

    return item.description ?? '';
  }
}
