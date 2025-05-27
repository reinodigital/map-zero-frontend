import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountService, ItemService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';

import { CabysSelectComponent } from '../../../../shared/components/cabys-select/cabys-select.component';
import { formatDateToString, taxRateArray } from '../../../../shared/helpers';

import { TypeMessageToast } from '../../../../enums';
import { IAccount, IItem } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'edit-item',
  standalone: true,
  imports: [ReactiveFormsModule, CabysSelectComponent],
  templateUrl: './edit-item.component.html',
  styleUrl: './edit-item.component.scss',
})
export default class EditItemComponent {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private accountService = inject(AccountService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // DATA
  public itemId!: number;
  public item = signal<IItem | null>(null);
  public accounts = signal<IAccount[]>([]);
  public taxesArray = taxRateArray;

  // FORM
  public editItemForm = signal<FormGroup | null>(null);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    this.itemId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchItem();
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

  fetchItem(): void {
    this.itemService
      .fetchOne(this.itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.item.set(resp);
          this.fillOutForm();
        }
      });
  }

  fillOutForm(): void {
    this.editItemForm.set(
      this.fb.group({
        name: [
          this.item()?.name ?? '',
          [Validators.required, Validators.minLength(2)],
        ],
        cabys: [this.item()?.cabys?.code ?? null, [Validators.required]],
        costPrice: [this.item()?.costPrice ?? null, []],
        purchaseAccountId: [this.item()?.purchaseAccount?.id ?? '', []],
        purchaseTaxRate: [this.item()?.purchaseTaxRate ?? '', []],
        purchaseDescription: [this.item()?.purchaseDescription ?? '', []],
        salePrice: [this.item()?.salePrice ?? null, []],
        saleAccountId: [this.item()?.saleAccount?.id ?? '', []],
        saleTaxRate: [this.item()?.saleTaxRate ?? '', []],
        saleDescription: [this.item()?.saleDescription ?? '', []],
      })
    );
  }

  validField(field: string): boolean {
    return (
      this.editItemForm()!.controls[field].touched &&
      this.editItemForm()!.controls[field].invalid
    );
  }

  onCabysChange(cabys: string | null): void {
    this.editItemForm()?.controls['cabys'].patchValue(cabys);
  }

  onSubmit(): void {
    if (!this.editItemForm()?.value['cabys']) {
      this.customToastService.add({
        message: 'Cabys es necesario para editar Item y está faltando.',
        type: TypeMessageToast.ERROR,
        duration: 5000,
      });
    }

    if (this.editItemForm()?.invalid) {
      this.formErrorService.throwFormErrors(this.editItemForm()!);

      return;
    }

    const data = this.editItemForm()?.value;
    data.updatedAt = formatDateToString(new Date());

    this.itemService.update(this.itemId, data).subscribe((resp) => {
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
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-items');
  }
}
