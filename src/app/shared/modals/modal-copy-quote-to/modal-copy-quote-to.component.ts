import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NameEntities } from '../../../enums';

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
  public dialogRef = inject(MatDialogRef<ModalCopyQuoteToComponent>);

  public branchId = signal<number | null>(null);
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
    this.branchId.set(data.quoteId);
  }

  onSelectOption(option: string): void {
    this.selectedOption.set(option);
  }

  closePopUp() {
    this.dialogRef.close();
  }

  executeCopy(): void {
    if (!this.selectedOption()) return;

    // TODO: make a switch and apply option copy
    console.log(this.selectedOption());
  }
}
