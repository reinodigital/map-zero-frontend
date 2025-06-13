import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ModalCopyQuoteToComponent } from '../../../shared/modals/modal-copy-quote-to/modal-copy-quote-to.component';

@Injectable({
  providedIn: 'root',
})
export class DetailCopyQuoteToService {
  private dialog = inject(MatDialog);

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
}
