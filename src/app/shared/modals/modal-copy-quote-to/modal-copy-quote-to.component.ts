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

import { QuoteService } from '../../../api';
import { CustomToastService } from '../../services/custom-toast.service';
import { DetailCopyQuoteToService } from '../../../modules/business/quotes/detail-copy-quote-to.service';

import { NameEntities, TypeMessageToast } from '../../../enums';
import { formatDateToString } from '../../helpers';

interface ICopyToOption {
  entity: string;
  label: string;
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-copy-quote-to',
  templateUrl: './modal-copy-quote-to.component.html',
  styleUrls: ['./modal-copy-quote-to.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ModalCopyQuoteToComponent {
  private dialogRef = inject(MatDialogRef<ModalCopyQuoteToComponent>);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private detailCopyQuoteToService = inject(DetailCopyQuoteToService);
  private customToastService = inject(CustomToastService);

  public quoteId = signal<number | null>(null);
  public selectedOption = signal<string | null>(null);

  public arrCopyToOptions: ICopyToOption[] = [
    {
      entity: NameEntities.QUOTE,
      label: 'Cotización',
      text: 'reutilizar el contenido en una nueva cotización',
    },
    {
      entity: NameEntities.INVOICE,
      label: 'Factura',
      text: 'facturar esta cotización a un cliente',
    },
    {
      entity: NameEntities.PURCHASE_ORDER,
      label: 'Orden de compra',
      text: 'ordenar compra de esta cotización',
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { quoteId: number }
  ) {
    this.quoteId.set(data.quoteId);
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
      case NameEntities.QUOTE:
        this.generateCopyToQuote();
        break;
      case NameEntities.INVOICE:
        this.generateCopyToInvoice();
        break;
      case NameEntities.PURCHASE_ORDER:
        // TODO: generate copy To Purchase order
        break;

      default:
        break;
    }
  }

  generateCopyToQuote(): void {
    const createdAt = formatDateToString(new Date());
    this.quoteService
      .copyToDraft(this.quoteId()!, createdAt)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.customToastService.add({
            message: `Cotización como borrador generada correctamente.`,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });

          this.closePopUp();
          this.router.navigateByUrl(`/detail-quote/${resp.id}`);
          this.detailCopyQuoteToService.triggerCurrentQuoteHasBeenCopied(
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

  generateCopyToInvoice(): void {
    // TODO: generateCopyToInvoice
  }
}
