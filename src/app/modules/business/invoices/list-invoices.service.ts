import { Injectable, signal } from '@angular/core';
import { StatusInvoice } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class ListInvoicesService {
  public lastOffsetInvoicesList = signal<number>(0);

  // TABS
  public selectedTabIndex = signal<number>(0);
  public statusByIndexMap: Record<number, string> = {
    0: '', // 'Todas'
    1: StatusInvoice.DRAFT,
    2: StatusInvoice.AWAITING_APPROVAL,
    3: StatusInvoice.AWAITING_PAYMENT,
    4: StatusInvoice.PAID,
  };
}
