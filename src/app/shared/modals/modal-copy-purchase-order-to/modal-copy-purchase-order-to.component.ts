import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Inject,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PurchaseOrderService } from '../../../api';
import { CustomToastService } from '../../services/custom-toast.service';

import { NameEntities, TypeMessageToast } from '../../../enums';
import { formatDateToString } from '../../helpers';

import { DetailCopyPurchaseOrderToService } from '../../../modules/business/purchase-orders/detail-copy-purchase-order-to.service';

interface ICopyToOption {
  entity: string;
  label: string;
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-copy-purchase-order-to',
  templateUrl: './modal-copy-purchase-order-to.component.html',
  styleUrls: ['./modal-copy-purchase-order-to.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ModalCopyPurchaseOrderToComponent {
  private dialogRef = inject(MatDialogRef<ModalCopyPurchaseOrderToComponent>);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private purchaseOrderService = inject(PurchaseOrderService);
  private detailCopyPurchaseOrderToService = inject(
    DetailCopyPurchaseOrderToService
  );
  private customToastService = inject(CustomToastService);

  public purchaseOrderId = signal<number | null>(null);
  public selectedOption = signal<string | null>(null);

  public arrCopyToOptions: ICopyToOption[] = [
    // {
    //   entity: NameEntities.PURCHASE_ORDER,
    //   label: 'Cotización',
    //   text: 'reutilizar el contenido en una nueva cotización',
    // },
    // {
    //   entity: NameEntities.INVOICE,
    //   label: 'Factura',
    //   text: 'facturar esta cotización a un cliente',
    // },
    {
      entity: NameEntities.PURCHASE_ORDER,
      label: 'Orden de compra',
      text: 'reutiliza contenido de esta orden de compra',
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { purchaseOrderId: number }
  ) {
    this.purchaseOrderId.set(data.purchaseOrderId);
  }

  onSelectOption(option: string): void {
    this.selectedOption.set(option);
  }

  closePopUp() {
    this.dialogRef.close();
  }

  executeCopy(): void {
    if (!this.selectedOption()) return;

    switch (this.selectedOption()) {
      // case NameEntities.QUOTE:
      //   this.generateCopyToPurchaseQuote();
      //   break;
      // case NameEntities.INVOICE:
      //   this.generateCopyToInvoice();
      //   break;
      case NameEntities.PURCHASE_ORDER:
        // TODO: generate copy To Purchase order
        break;

      default:
        break;
    }
  }

  generateCopyToPurchaseOrder(): void {
    const createdAt = formatDateToString(new Date());
    this.purchaseOrderService
      .copyToDraft(this.purchaseOrderId()!, createdAt)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.customToastService.add({
            message: `Orden de compra como borrador generada correctamente.`,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });

          this.closePopUp();
          this.router.navigateByUrl(`/detail-purchase-order/${resp.id}`);
          this.detailCopyPurchaseOrderToService.triggerCurrentPurchaseOrderHasBeenCopied(
            resp.id
          );
        } else {
          this.customToastService.add({
            message: resp.message,
            type: TypeMessageToast.ERROR,
            duration: 5000,
          });
        }
      });
  }
}
