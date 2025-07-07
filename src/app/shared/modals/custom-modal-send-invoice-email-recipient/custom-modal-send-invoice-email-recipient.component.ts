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
  ICustomDataToModalEmailSendInvoice,
  IDataEmailForSendInvoice,
} from '../../../interfaces';
import { TypeMessageToast } from '../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-modal-send-invoice-email-recipient',
  imports: [ReactiveFormsModule],
  templateUrl: './custom-modal-send-invoice-email-recipient.component.html',
  styleUrls: ['./custom-modal-send-invoice-email-recipient.component.scss'],
  standalone: true,
})
export class CustomModalSendInvoiceEmailRecipientComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<CustomModalSendInvoiceEmailRecipientComponent>
  );
  private customToastService = inject(CustomToastService);

  public data = signal<ICustomDataToModalEmailSendInvoice | null>(null);

  // EMAIL LOGIC
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public emails = signal<string[]>([]);

  // FORM
  public newSendInvoiceEmailForm = signal(
    this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      subject: ['', []],
      message: ['', []],
    })
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dataMessage: ICustomDataToModalEmailSendInvoice
  ) {
    this.data.set(dataMessage);
    this.buildEmail();
  }

  buildEmail(): void {
    const message = `Hola ${
      this.data()?.clientName
    },\n\nEsta es la factura correspondiente por ${
      this.data()?.currency
    } ${this.data()?.total.toFixed(
      2
    )}\n\nSiéntese libre de comunicarse con nosotros si existe alguna duda.\n\nVer pdf de factura adjunto a este correo.\n\nSaludos.`;

    const subject = `Factura de parte de Map Soluciones`;

    this.newSendInvoiceEmailForm().controls['message'].patchValue(message);
    this.newSendInvoiceEmailForm().controls['subject'].patchValue(subject);
  }

  addEmail(): void {
    const emailControl = this.newSendInvoiceEmailForm().controls['email'];
    const email = emailControl.value;

    if (email && this.emails().includes(email)) {
      this.newSendInvoiceEmailForm().controls['email'].patchValue('');

      return;
    }

    if (emailControl.valid && email) {
      this.emails().push(email);
      this.newSendInvoiceEmailForm().controls['email'].patchValue('');
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
    const dataEmail: IDataEmailForSendInvoice = {
      sentAt: formatDateToString(new Date()),
      emails: this.emails(),
      message: this.newSendInvoiceEmailForm().controls['message'].value ?? '',
      subject: this.newSendInvoiceEmailForm().controls['subject'].value ?? '',
    };

    this.dialogRef.close(JSON.stringify(dataEmail));
  }
}
