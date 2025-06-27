import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ModalCopyPurchaseOrderToComponent } from '../../../shared/modals/modal-copy-purchase-order-to/modal-copy-purchase-order-to.component';

@Injectable({
  providedIn: 'root',
})
export class DetailCopyPurchaseOrderToService {
  private dialog = inject(MatDialog);
  private _currentPurchaseOrderCopied$ = new Subject<number>();
  public currentPurchaseOrderCopied$ =
    this._currentPurchaseOrderCopied$.asObservable();

  displayModalCopyPurchaseOrderTo(purchaseOrderId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalCopyPurchaseOrderToComponent, {
      width: '70rem',
      height: 'auto',
      autoFocus: false,
      data: { purchaseOrderId },
    });

    dialogRef.updatePosition({ top: '100px' });
  }

  triggerCurrentPurchaseOrderHasBeenCopied(
    redirectToPurchaseOrderId: number
  ): void {
    this._currentPurchaseOrderCopied$.next(redirectToPurchaseOrderId);
  }
}
