import { Injectable, signal } from '@angular/core';
import { StatusPurchaseOrder } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class ListPurchaseOrdersService {
  public lastOffsetPurchaseOrdersList = signal<number>(0);

  // TABS
  public selectedTabIndex = signal<number>(0);
  public statusByIndexMap: Record<number, string> = {
    0: '', // 'Todas'
    1: StatusPurchaseOrder.DRAFT,
    2: StatusPurchaseOrder.SENT,
    3: StatusPurchaseOrder.AWAITING_APPROVAL,
    4: StatusPurchaseOrder.APPROVED,
    5: StatusPurchaseOrder.BILLED,
  };
}
