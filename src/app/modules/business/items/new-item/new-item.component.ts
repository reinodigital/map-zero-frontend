import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountService, ItemService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { CabysSelectComponent } from '../../../../shared/components/cabys-select/cabys-select.component';
import { formatDateToString, taxRateArray } from '../../../../shared/helpers';

import { TypeMessageToast } from '../../../../enums';
import { IAccount } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-item',
  standalone: true,
  imports: [ReactiveFormsModule, CabysSelectComponent],
  templateUrl: './new-item.component.html',
  styleUrl: './new-item.component.scss',
})
export default class NewItemComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private accountService = inject(AccountService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  public accounts = signal<IAccount[]>([]);
  public taxesArray = taxRateArray;

  // FORM
  public newItemForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      cabys: [null, [Validators.required]],
      costPrice: [null, []],
      purchaseAccountId: ['', []],
      purchaseTaxRate: ['', []],
      purchaseDescription: ['', []],
      salePrice: [null, []],
      saleAccountId: ['', []],
      saleTaxRate: ['', []],
      saleDescription: ['', []],
    })
  );

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.accountService
      .fetchAll(999, 0, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.accounts) {
          this.accounts.set(resp.accounts);
        }
      });
  }

  validField(field: string): boolean {
    return (
      this.newItemForm().controls[field].touched &&
      this.newItemForm().controls[field].invalid
    );
  }

  onCabysChange(cabys: string | null): void {
    this.newItemForm().controls['cabys'].patchValue(cabys);
  }

  onSubmit(): void {
    if (!this.newItemForm().value['cabys']) {
      this.customToastService.add({
        message: 'Cabys es necesario para crear Item y está faltando.',
        type: TypeMessageToast.ERROR,
        duration: 5000,
      });
    }

    if (this.newItemForm().invalid) {
      this.formErrorService.throwFormErrors(this.newItemForm());

      return;
    }

    const data = this.newItemForm().value;
    data.createdAt = formatDateToString(new Date());

    this.itemService.create(data).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });
        this.router.navigateByUrl('/list-items');
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 5000,
        });
      }
    });
  }

  // --------- HELPERS ----------
  // Redirect to list, but if filters applies then keep them
  public comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-items');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
