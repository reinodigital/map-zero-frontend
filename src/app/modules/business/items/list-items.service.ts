import { Injectable, signal } from '@angular/core';
import { getTaxRateLabel } from '../../../shared/helpers';

@Injectable({
  providedIn: 'root',
})
export class ListItemsService {
  public lastOffsetItemsList = signal<number>(0);

  public getTaxRateLabel(code: string): string {
    return getTaxRateLabel(code);
  }
}
