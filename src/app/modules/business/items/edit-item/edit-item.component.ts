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

import { ItemService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';

import { CabysSelectComponent } from '../../../../shared/components/cabys-select/cabys-select.component';
import { formatDateToString } from '../../../../shared/helpers';

import { TypeMessageToast } from '../../../../enums';
import { IItem } from '../../../../interfaces';

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
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // DATA
  public itemId!: number;
  public item = signal<IItem | null>(null);

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
        costPrice: [this.item()?.costPrice ?? '', [Validators.required]],
        purchaseAccount: [
          this.item()?.purchaseAccount ?? '300',
          [Validators.required],
        ],
        purchaseTaxRate: [
          this.item()?.purchaseTaxRate ?? '08',
          [Validators.required],
        ],
        purchaseDescription: [this.item()?.purchaseDescription ?? '', []],
        salePrice: [this.item()?.salePrice ?? '', [Validators.required]],
        saleAccount: [this.item()?.saleAccount ?? '200', [Validators.required]],
        saleTaxRate: [this.item()?.saleTaxRate ?? '08', [Validators.required]],
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
