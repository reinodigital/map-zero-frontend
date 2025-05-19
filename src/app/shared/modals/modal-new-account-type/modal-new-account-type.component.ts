import { CommonModule } from '@angular/common';
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

import { AccountTypeService } from '../../../api';
import { FormErrorService } from '../../services/form-error.service';
import { CustomToastService } from '../../services/custom-toast.service';

import { AccountTypeCategory, TypeMessageToast } from '../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-new-account-type',
  templateUrl: './modal-new-account-type.component.html',
  styleUrls: ['./modal-new-account-type.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalNewAccountTypeComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModalNewAccountTypeComponent>);
  private formErrorService = inject(FormErrorService);
  private accountTypeService = inject(AccountTypeService);
  private customToastService = inject(CustomToastService);

  public categories: string[] = Object.values(AccountTypeCategory);

  public newAccountTypeForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['activos', [Validators.required]],
    })
  );

  closePopUp(resp: string | null = null) {
    this.dialogRef.close(resp);
  }

  validField(field: string) {
    return (
      this.newAccountTypeForm().controls[field].touched &&
      this.newAccountTypeForm().controls[field].invalid
    );
  }

  onSubmit(): void {
    if (this.newAccountTypeForm().invalid) {
      this.formErrorService.throwFormErrors(this.newAccountTypeForm());

      return;
    }

    this.accountTypeService
      .create(this.newAccountTypeForm().value)
      .subscribe((resp) => {
        if (resp && resp.msg) {
          this.customToastService.add({
            message: resp.msg,
            type: TypeMessageToast.SUCCESS,
            duration: 5000,
          });

          this.closePopUp(resp.msg);
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
