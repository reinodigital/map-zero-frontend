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

import { TypeMessageToast } from '../../../enums';
import { formatDateToString } from '../../helpers';
import { ICreateInvoiceFromAcceptedQuote, IQuote } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-create-invoice-from-quote',
  templateUrl: './modal-create-invoice-from-quote.component.html',
  styleUrls: ['./modal-create-invoice-from-quote.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ModalCreateInvoiceFromQuoteComponent {
  private dialogRef = inject(
    MatDialogRef<ModalCreateInvoiceFromQuoteComponent>
  );
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private quoteService = inject(QuoteService);
  private customToastService = inject(CustomToastService);

  public quote = signal<IQuote | null>(null);
  public markAsInvoiced = signal<boolean>(false);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: IQuote
  ) {
    this.quote.set(data);
  }

  closePopUp() {
    this.dialogRef.close();
  }

  onChangeMark(): void {
    this.markAsInvoiced.set(!this.markAsInvoiced());
  }

  createInvoice(): void {
    const data: ICreateInvoiceFromAcceptedQuote = {
      createdAt: formatDateToString(new Date()),
      markAsInvoiced: this.markAsInvoiced(),
    };

    this.quoteService
      .copyToInvoice(this.quote()!.id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.customToastService.add({
            message: `Factura como borrador generada correctamente.`,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });

          this.closePopUp();
          this.router.navigateByUrl(`/edit-invoice/${resp.id}`);
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
