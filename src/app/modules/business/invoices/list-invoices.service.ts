import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListInvoicesService {
  public lastOffsetInvoicesList = signal<number>(0);
}
