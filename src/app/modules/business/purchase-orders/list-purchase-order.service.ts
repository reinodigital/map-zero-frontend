import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListPurchaseOrdersService {
  public lastOffsetPurchaseOrdersList = signal<number>(0);
}
