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

import { AccountService, AccountTypeService } from '../../../api';
import { FormErrorService } from '../../services/form-error.service';
import { CustomToastService } from '../../services/custom-toast.service';
import { taxRateArray } from '../../helpers';

import { AccountTypeCategory, TypeMessageToast } from '../../../enums';
import {
  IDataModalAccountForm,
  IAccountType,
  ICodeLabel,
  IPayloadAccountForm,
} from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-create-update-account',
  templateUrl: './modal-create-update-account.component.html',
  styleUrls: ['./modal-create-update-account.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalCreateUpdateAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModalCreateUpdateAccountComponent>);
  private formErrorService = inject(FormErrorService);
  private accountTypeService = inject(AccountTypeService);
  private accountService = inject(AccountService);
  private customToastService = inject(CustomToastService);

  public taxRates: ICodeLabel[] = taxRateArray;
  public categories: string[] = Object.values(AccountTypeCategory);
  public accountsType = signal<IAccountType[]>([]);

  public newAccountForm = signal<FormGroup>(
    this.fb.group({
      accountTypeId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      description: [null, []],
      tax: [null, []],
    })
  );

  public accountId = signal<number | null>(null);
  public dataForm = signal<IPayloadAccountForm | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public payload: IDataModalAccountForm) {
    this.accountId.set(payload.id);
    this.dataForm.set(payload.account);
  }

  ngOnInit(): void {
    this.accountTypeService.fetchAll().subscribe((resp) => {
      if (resp) {
        this.accountsType.set(resp);

        this.fillOutForm();
      }
    });
  }

  fillOutForm(): void {
    if (!this.accountId()) return;

    this.newAccountForm().controls['accountTypeId'].patchValue(
      this.dataForm()?.accountTypeId
    );
    this.newAccountForm().controls['name'].patchValue(this.dataForm()?.name);
    this.newAccountForm().controls['code'].patchValue(this.dataForm()?.code);
    this.newAccountForm().controls['description'].patchValue(
      this.dataForm()?.description
    );
    this.newAccountForm().controls['tax'].patchValue(this.dataForm()?.tax);
  }

  closePopUp(resp: string | null = null) {
    this.dialogRef.close(resp);
  }

  validField(field: string) {
    return (
      this.newAccountForm().controls[field].touched &&
      this.newAccountForm().controls[field].invalid
    );
  }

  // STEP 1
  onSubmit(): void {
    if (this.newAccountForm().invalid) {
      this.formErrorService.throwFormErrors(this.newAccountForm());

      return;
    }

    this.accountId() ? this.updateAccount() : this.createAccount();
  }

  // STEP 2.1
  createAccount(): void {
    this.accountService
      .create(this.newAccountForm().value)
      .subscribe((resp) => {
        this.processResponse(resp);
      });
  }

  // STEP 2.2
  updateAccount(): void {
    this.accountService
      .update(this.accountId()!, this.newAccountForm().value)
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
