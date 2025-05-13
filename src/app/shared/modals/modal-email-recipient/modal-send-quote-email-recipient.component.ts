import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomToastService } from '../../services/custom-toast.service';
import { FormQuoteService } from '../../../pages/quotes/form-quote.service';
import { QuoteService } from '../../../api/index';
import { SubmitButtonComponent } from '../../components/submit-button/submit-button.component';
import { formatDateToString } from '../../helpers';
import {
  IDataEmailForSendQuote,
  IDataToModalEmailSendQuote,
  IDataToSubmitAndSaveNewQuote,
} from '../../../interfaces';
import { TypeMessageToast } from '../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'modal-send-quote-email-recipient',
  imports: [ReactiveFormsModule, SubmitButtonComponent],
  templateUrl: './modal-send-quote-email-recipient.component.html',
  styleUrls: ['./modal-send-quote-email-recipient.component.scss'],
  standalone: true,
})
export class ModalSendQuoteEmailRecipientComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<ModalSendQuoteEmailRecipientComponent>
  );
  private quoteService = inject(QuoteService);
  private customToastService = inject(CustomToastService);

  public data = signal<IDataToModalEmailSendQuote | null>(null);

  // EMAIL LOGIC
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public emails = signal<string[]>([]);

  // FORM
  public isFormSubmitting = signal<boolean>(false);
  public formQuoteService = inject(FormQuoteService);
  public newSendQuoteEmailForm = signal(
    this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      subject: ['', []],
      message: ['', []],
    })
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public dataMessage: IDataToModalEmailSendQuote
  ) {
    this.data.set(dataMessage);
    this.buildEmail();
  }

  buildEmail(): void {
    const message = `Hola ${
      this.data()?.quote.client.name
    },\n\nEsta es la cotización correspondiente a su pedido por ${
      this.data()?.quote.currency
    } ${this.data()?.total.toFixed(
      2
    )}\n\nSiéntese libre de comunicarse con nosotros si existe alguna duda.\n\nVer pdf de cotización adjunto a este correo.\n\nTérminos: ${
      this.data()?.quote.terms
    }\n\nSaludos.`;

    const subject = `Cotización de parte de Map Soluciones`;

    this.newSendQuoteEmailForm().controls['message'].patchValue(message);
    this.newSendQuoteEmailForm().controls['subject'].patchValue(subject);
  }

  addEmail(): void {
    const emailControl = this.newSendQuoteEmailForm().controls['email'];
    const email = emailControl.value;

    if (email && this.emails().includes(email)) {
      this.newSendQuoteEmailForm().controls['email'].patchValue('');

      return;
    }

    if (emailControl.valid && email) {
      this.emails().push(email);
      this.newSendQuoteEmailForm().controls['email'].patchValue('');
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
      this.dialogRef.close();

      return;
    }

    // submit data
    this.onSubmit();
  }

  onSubmit(): void {
    // verify emails is not empty
    if (!this.emails().length) {
      this.customToastService.add({
        message: 'Se ocupa al menos un correo electrónico de bandeja.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    // build data to send to backend
    const dataBackend: IDataToSubmitAndSaveNewQuote = {
      quote: this.data()!.quote,
    };

    this.isFormSubmitting.set(true);
    this.quoteService.create(dataBackend).subscribe((resp) => {
      if (resp && resp.id) {
        this.customToastService.add({
          message: `Cotización generada con estado ${dataBackend.quote.status} correctamente.`,
          type: TypeMessageToast.SUCCESS,
          duration: 8000,
        });

        // SEND QUOTE EMAIL TO CLIENT
        this.sendQuoteEmailToClient(resp.id);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 8000,
        });

        this.isFormSubmitting.set(false);
      }
    });
  }

  sendQuoteEmailToClient(quoteId: number) {
    const dataEmail: IDataEmailForSendQuote = {
      sentAt: formatDateToString(new Date()),
      emails: this.emails(),
      message: this.newSendQuoteEmailForm().controls['message'].value ?? '',
      subject: this.newSendQuoteEmailForm().controls['subject'].value ?? '',
    };

    this.quoteService.sendEmail(quoteId, dataEmail).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 10000,
        });

        this.dialogRef.close();
        this.router.navigateByUrl(`/detail-quote/${quoteId}`);
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 10000,
        });
      }

      this.isFormSubmitting.set(false);
    });
  }
}
