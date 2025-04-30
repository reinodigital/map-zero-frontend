import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { FormErrorService } from '../../services/form-error.service';
import { IDataToCreateNewClientContact } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-client-contact',
  templateUrl: './modal-client-contact.component.html',
  styleUrls: ['./modal-client-contact.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ModalClientContactComponent {
  private fb = inject(FormBuilder);
  private formErrorService = inject(FormErrorService);
  public dialogRef = inject(MatDialogRef<ModalClientContactComponent>);

  public errMsg = signal<string>('');
  public contactForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', []],
      email: ['', []],
      mobile: ['', []],
    })
  );

  closePopUp(resp: string | null = null) {
    this.dialogRef.close(resp);
  }

  validField(field: string) {
    return (
      this.contactForm().controls[field].touched &&
      this.contactForm().controls[field].invalid
    );
  }

  onSubmit(): void {
    if (this.contactForm().invalid) {
      this.formErrorService.throwFormErrors(this.contactForm());

      return;
    }

    const data: IDataToCreateNewClientContact = {
      name: this.contactForm().controls['name'].value,
      lastName: this.contactForm().controls['lastName'].value
        ? this.contactForm().controls['lastName'].value
        : null,
      email: this.contactForm().controls['email'].value
        ? this.contactForm().controls['email'].value
        : null,
      mobile: this.contactForm().controls['mobile'].value
        ? this.contactForm().controls['mobile'].value
        : null,
    };

    this.closePopUp(JSON.stringify(data));
  }
}
