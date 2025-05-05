import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { Router } from '@angular/router';

import { CabysSelectComponent } from '../../../shared/components/cabys-select/cabys-select.component';
import { FormErrorService } from '../../../shared/services/form-error.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import { TypeMessageToast } from '../../../enums';
import { ItemService } from '../../../api';
import { formatDateToString } from '../../../shared/helpers';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-item',
  standalone: true,
  imports: [ReactiveFormsModule, CabysSelectComponent],
  templateUrl: './new-item.component.html',
  styleUrl: './new-item.component.scss',
})
export default class NewItemComponent {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // FORM
  public newItemForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      cabys: [null, [Validators.required]],
      costPrice: ['', [Validators.required]],
      purchaseAccount: ['300', [Validators.required]],
      purchaseTaxRate: ['08', [Validators.required]],
      purchaseDescription: ['', []],
      salePrice: ['', [Validators.required]],
      saleAccount: ['200', [Validators.required]],
      saleTaxRate: ['08', [Validators.required]],
      saleDescription: ['', []],
    })
  );

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
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
