import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { MatDialogRef } from '@angular/material/dialog';

import { AccountService, AccountTypeService } from '../../../api';
import { FormErrorService } from '../../services/form-error.service';
import { CustomToastService } from '../../services/custom-toast.service';
import { taxRateArray } from '../../helpers';

import { AccountTypeCategory, TypeMessageToast } from '../../../enums';
import { IAccountType, ICodeLabel } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'modal-new-account',
  templateUrl: './modal-new-account.component.html',
  styleUrls: ['./modal-new-account.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class ModalNewAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModalNewAccountComponent>);
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

  ngOnInit(): void {
    this.accountTypeService.fetchAll().subscribe((resp) => {
      if (resp) {
        this.accountsType.set(resp);
      }
    });
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

  onSubmit(): void {
    if (this.newAccountForm().invalid) {
      this.formErrorService.throwFormErrors(this.newAccountForm());

      return;
    }

    this.accountService
      .create(this.newAccountForm().value)
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
