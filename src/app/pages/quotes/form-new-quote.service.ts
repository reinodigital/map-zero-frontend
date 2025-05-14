import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { QuoteService } from '../../api/quote.service';
import { CustomToastService } from '../../shared/services/custom-toast.service';
import { CustomModalSendQuoteEmailRecipientComponent } from '../../shared/modals/custom-modal-send-quote-email-recipient/custom-modal-send-quote-email-recipient.component';
import { getTaxRateValue } from '../../shared/helpers';

import { NewQuoteFormAction, TypeMessageToast } from '../../enums';
import {
  ICustomDataToModalEmailSendQuote,
  IDataEmailForSendQuote,
  IDataToCreateQuote,
  IDataToSubmitAndSaveNewQuote,
} from '../../interfaces';

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

  // TOTALS
  public subtotal = signal<number>(0);
  public totalDiscount = signal<number>(0);
  public totalTax = signal<number>(0);
  public totalAmount = signal<number>(0);

  public calculateTotals(quoteItems: FormArray): void {
    // subtotal
    const subtotal = quoteItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return sum + quantity * price;
    }, 0);

    // total discount
    const totalDiscount = quoteItems.controls.reduce((sum, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const discount = control.get('discount')?.value || 0;
      const discountAmount = (quantity * price * discount) / 100;
      return sum + discountAmount;
    }, 0);

    // pre tax total
    const preTaxTotal = subtotal - totalDiscount;

    // total tax amount
    let totalTaxAmount = 0;
    quoteItems.controls.forEach((control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const discount = control.get('discount')?.value || 0;
      const discountAmount = (quantity * price * discount) / 100;

      const taxRateCode = control.get('taxRate')?.value || '08';
      const taxableAmount = quantity * price - discountAmount;
      totalTaxAmount += (taxableAmount * getTaxRateValue(taxRateCode)) / 100;
    });

    this.subtotal.set(subtotal);
    this.totalDiscount.set(totalDiscount);
    this.totalTax.set(totalTaxAmount);

    // total
    this.totalAmount.set(preTaxTotal + totalTaxAmount);
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
    const dataBackend: IDataToSubmitAndSaveNewQuote = {
      quote: data,
    };

    this.isFormSubmitting.set(true);
    this.quoteService.create(dataBackend).subscribe((resp) => {
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

  // STEP 1 display modal and get data email
  handleCreateNewQuoteSendingEmailAsWell(quote: IDataToCreateQuote) {
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
        this.onCreateNewQuoteSendingEmail(quote, JSON.parse(dataEmail));
      }
    });
  }

  // STEP 2 create new quote sending email
  onCreateNewQuoteSendingEmail(
    data: IDataToCreateQuote,
    dataEmail: IDataEmailForSendQuote
  ): void {
    const dataBackend = { quote: data };

    this.quoteService.create(dataBackend).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización generada con estado ${dataBackend.quote.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 8000,
        });

        // SEND QUOTE EMAIL TO CLIENT
        this.sendQuoteEmailAfterNewQuoteCreated(resp.id, dataEmail);
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
  sendQuoteEmailAfterNewQuoteCreated(
    quoteId: number,
    data: IDataEmailForSendQuote
  ) {
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
}
