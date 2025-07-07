import { Injectable, signal } from '@angular/core';
import { StatusQuote } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class ListQuotesService {
  public lastOffsetQuotesList = signal<number>(0);

  // TABS
  public selectedTabIndex = signal<number>(0);
  public statusByIndexMap: Record<number, string> = {
    0: '', // 'Todas'
    1: StatusQuote.DRAFT,
    2: StatusQuote.SENT,
    3: StatusQuote.DECLINED,
    4: StatusQuote.ACCEPTED,
    5: StatusQuote.INVOICED,
  };
}
