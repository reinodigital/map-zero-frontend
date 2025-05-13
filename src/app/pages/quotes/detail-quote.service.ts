import { Injectable, signal } from '@angular/core';

import { getTaxRateLabel, getTaxRateValue } from '../../shared/helpers';

import { StatusQuote } from '../../enums';
import { IQuoteItem, ITotals } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class DetailQuoteService {
  public lastOffsetQuotesList = signal<number>(0);

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

      default:
        break;
    }

    return result;
  }
}
