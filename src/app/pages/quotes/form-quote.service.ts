import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { QuoteService } from '../../api/quote.service';

import { getTaxRateValue } from '../../shared/helpers';
import { FormSubmitActions, TypeMessageToast } from '../../enums';
import { IDataToCreateQuote } from '../../interfaces';
import { CustomToastService } from '../../shared/services/custom-toast.service';

@Injectable({
  providedIn: 'root',
})
export class FormQuoteService {
  private router = inject(Router);
  private customToastService = inject(CustomToastService);
  private quoteService = inject(QuoteService);

  // ACTIONS
  public saveAction = FormSubmitActions.SAVE;
  public sendAction = FormSubmitActions.SEND;
  public markAsSentAction = FormSubmitActions.MARK_AS_SENT;

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
    this.quoteService.create(data).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });
        this.router.navigateByUrl('/list-quotes');
        // TODO: change this to receive quoteId and redirect to detail quote
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 5000,
        });
      }
    });
  }
}
