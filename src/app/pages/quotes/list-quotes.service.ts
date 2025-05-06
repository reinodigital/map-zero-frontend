import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListQuotesService {
  public lastOffsetQuotesList = signal<number>(0);
}
