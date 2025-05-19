import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AccountTypeService } from '../../../api';
import { FormErrorService } from '../../services/form-error.service';
import { CustomToastService } from '../../services/custom-toast.service';

import { AccountTypeCategory, TypeMessageToast } from '../../../enums';
import {
  IDataModalAccountTypeForm,
  IPayloadAccountTypeForm,
} from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-create-update-account-type',
  templateUrl: './modal-create-update-account-type.component.html',
  styleUrls: ['./modal-create-update-account-type.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalCreateUpdateAccountTypeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(
    MatDialogRef<ModalCreateUpdateAccountTypeComponent>
  );
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

  public accountTypeId = signal<number | null>(null);
  public dataForm = signal<IPayloadAccountTypeForm | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public payload: IDataModalAccountTypeForm
  ) {
    this.accountTypeId.set(payload.id);
    this.dataForm.set(payload.accountType);
  }

  ngOnInit(): void {
    this.fillOutForm();
  }

  fillOutForm(): void {
    if (!this.accountTypeId()) return;

    this.newAccountTypeForm().controls['name'].patchValue(
      this.dataForm()?.name
    );
    this.newAccountTypeForm().controls['category'].patchValue(
      this.dataForm()?.category
    );
  }

  closePopUp(resp: string | null = null) {
    this.dialogRef.close(resp);
  }

  validField(field: string) {
    return (
      this.newAccountTypeForm().controls[field].touched &&
      this.newAccountTypeForm().controls[field].invalid
    );
  }

  // STEP 1
  onSubmit(): void {
    if (this.newAccountTypeForm().invalid) {
      this.formErrorService.throwFormErrors(this.newAccountTypeForm());

      return;
    }

    this.accountTypeId() ? this.updateAccountType() : this.createAccountType();
  }

  // STEP 2.1
  createAccountType(): void {
    this.accountTypeService
      .create(this.newAccountTypeForm().value)
      .subscribe((resp) => {
        this.processResponse(resp);
      });
  }

  // STEP 2.2
  updateAccountType(): void {
    this.accountTypeService
      .update(this.accountTypeId()!, this.newAccountTypeForm().value)
      .subscribe((resp) => {
        this.processResponse(resp);
      });
  }

  // STEP 3
  processResponse(resp: any): void {
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
  }
}
