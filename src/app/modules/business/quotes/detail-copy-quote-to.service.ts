import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ModalCopyQuoteToComponent } from '../../../shared/modals/modal-copy-quote-to/modal-copy-quote-to.component';

@Injectable({
  providedIn: 'root',
})
export class DetailCopyQuoteToService {
  private dialog = inject(MatDialog);
  private _currentQuoteCopied$ = new Subject<number>();
  public currentQuoteCopied$ = this._currentQuoteCopied$.asObservable();

  displayModalCopyQuoteTo(quoteId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalCopyQuoteToComponent, {
      width: '70rem',
      height: 'auto',
      autoFocus: false,
      data: { quoteId },
    });

    dialogRef.updatePosition({ top: '100px' });
  }

  triggerCurrentQuoteHasBeenCopied(redirectToQuoteId: number): void {
    this._currentQuoteCopied$.next(redirectToQuoteId);
  }
}
