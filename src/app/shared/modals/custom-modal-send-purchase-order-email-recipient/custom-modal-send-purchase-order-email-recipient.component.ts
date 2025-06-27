import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomToastService } from '../../services/custom-toast.service';
import { formatDateToString } from '../../helpers';
import {
  ICustomDataToModalEmailSendPurchaseOrder,
  IDataEmailForSendPurchaseOrder,
} from '../../../interfaces';
import { TypeMessageToast } from '../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-modal-send-purchase-order-email-recipient',
  imports: [ReactiveFormsModule],
  templateUrl:
    './custom-modal-send-purchase-order-email-recipient.component.html',
  styleUrls: [
    './custom-modal-send-purchase-order-email-recipient.component.scss',
  ],
  standalone: true,
})
export class CustomModalSendPurchaseOrderEmailRecipientComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<CustomModalSendPurchaseOrderEmailRecipientComponent>
  );
  private customToastService = inject(CustomToastService);

  public data = signal<ICustomDataToModalEmailSendPurchaseOrder | null>(null);

  // EMAIL LOGIC
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public emails = signal<string[]>([]);

  // FORM
  public newSendPurchaseOrderEmailForm = signal(
    this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      subject: ['', []],
      message: ['', []],
    })
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dataMessage: ICustomDataToModalEmailSendPurchaseOrder
  ) {
    this.data.set(dataMessage);
    this.buildEmail();
  }

  buildEmail(): void {
    const message = `Hola ${
      this.data()?.clientName
    },\n\nOrden de compra correspondiente a su pedido por ${
      this.data()?.currency
    } ${this.data()?.total.toFixed(
      2
    )}\n\nSiéntese libre de comunicarse con nosotros si existe alguna duda.\n\nVer pdf de orden de compra adjunto a este correo.\n\nInstrucciones de entrega: ${
      this.data()?.deliveryInstructions
    }\n\nSaludos.`;

    const subject = `Orden de compra de parte de Map Soluciones`;

    this.newSendPurchaseOrderEmailForm().controls['message'].patchValue(
      message
    );
    this.newSendPurchaseOrderEmailForm().controls['subject'].patchValue(
      subject
    );
  }

  addEmail(): void {
    const emailControl = this.newSendPurchaseOrderEmailForm().controls['email'];
    const email = emailControl.value;

    if (email && this.emails().includes(email)) {
      this.newSendPurchaseOrderEmailForm().controls['email'].patchValue('');

      return;
    }

    if (emailControl.valid && email) {
      this.emails().push(email);
      this.newSendPurchaseOrderEmailForm().controls['email'].patchValue('');
    } else {
      this.customToastService.add({
        message: 'Formato de correo electrónico inválido.',
        type: TypeMessageToast.ERROR,
        duration: 8000,
      });
    }
  }

  removeEmail(index: number): void {
    this.emails().splice(index, 1);
  }

  closePopUp(e: string) {
    // verify button clicked
    if (e !== 'send') {
      this.dialogRef.close(null);

      return;
    }

    // submit data
    this.onSend();
  }

  onSend(): void {
    // verify emails is not empty
    if (!this.emails().length) {
      this.customToastService.add({
        message: 'Se ocupa al menos un correo electrónico de bandeja.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    // prepare data to send to component or service call this modal
    const dataEmail: IDataEmailForSendPurchaseOrder = {
      sentAt: formatDateToString(new Date()),
      emails: this.emails(),
      message:
        this.newSendPurchaseOrderEmailForm().controls['message'].value ?? '',
      subject:
        this.newSendPurchaseOrderEmailForm().controls['subject'].value ?? '',
    };

    this.dialogRef.close(JSON.stringify(dataEmail));
  }
}
