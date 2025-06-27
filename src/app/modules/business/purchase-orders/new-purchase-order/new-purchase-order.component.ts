import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgSelectModule } from '@ng-select/ng-select';
import { filter } from 'rxjs';

import { AuthService, ClientService, AccountService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { FormNewPurchaseOrderService } from '../form-new-purchase-order.service';

import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import {
  taxRateArray,
  formatDateForInput,
  formatDateToString,
} from '../../../../shared/helpers';

import {
  TypeMessageToast,
  NewPurchaseOrderFormAction,
  StatusPurchaseOrder,
} from '../../../../enums';
import {
  ShortAuth,
  ICodeLabel,
  ICommonSelect,
  IAccount,
  IDataToCreatePurchaseOrder,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-purchase-order',
  standalone: true,
  imports: [
    CommonModule,
    CustomSelectComponent,
    ReactiveFormsModule,
    NgSelectModule,
    SubmitButtonComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './new-purchase-order.component.html',
  styleUrl: './new-purchase-order.component.scss',
})
export default class NewPurchaseOrderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private commonAdminService = inject(CommonAdminService);
  // private itemService = inject(ItemService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  // FORM
  public formNewPurchaseOrderService = inject(FormNewPurchaseOrderService);
  public isFormSubmitting = computed(() =>
    this.formNewPurchaseOrderService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public newPurchaseOrderForm: FormGroup = this.fb.group({
    client: [null, [Validators.required]],
    initDate: [this.currentDate, [Validators.required]],
    deliveryDate: ['', []],
    currency: ['USD', [Validators.required]],
    deliveryInstructions: ['', []],
    purchaseOrderItems: this.fb.array([
      this.createPurchaseOrderItemFormGroup(),
      this.createPurchaseOrderItemFormGroup(),
    ]),
  });

  // TOTALS
  public subtotal = computed(() => this.formNewPurchaseOrderService.subtotal());
  public totalDiscount = computed(() =>
    this.formNewPurchaseOrderService.totalDiscount()
  );
  public totalTax = computed(() => this.formNewPurchaseOrderService.totalTax());
  public totalAmount = computed(() =>
    this.formNewPurchaseOrderService.totalAmount()
  );

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get currentDate(): any {
    return formatDateForInput(new Date());
  }

  ngOnInit(): void {
    this.formNewPurchaseOrderService.cleanTotalValues();
    this.fetchAllShortClients();
    this.fetchSellers();
    this.fetchAccounts();

    // Set up listeners for all existing purchase-order item rows at the beginning
    this.purchaseOrderItems.controls.forEach((control) => {
      this.setupItemGroupValueChangeListener(control as FormGroup);
    });
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

  fetchAllShortClients(): void {
    this.clientService
      .fetchAllShortClients()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((clients) => {
        if (clients) {
          this.clients.set(clients);
        }
      });
  }

  fetchSellers(): void {
    this.authService.fetchAllSellers().subscribe((resp) => {
      if (resp && resp.length) {
        this.sellers.set(resp);
      }
    });
  }

  validField(controlPath: string): boolean {
    const control = this.newPurchaseOrderForm.get(controlPath);
    if (!control) return false;
    return control.touched && control.invalid;
  }

  // ==== PURCHASE-ORDER ITEMS =====
  get purchaseOrderItems(): FormArray {
    return this.newPurchaseOrderForm.get('purchaseOrderItems') as FormArray;
  }

  createPurchaseOrderItemFormGroup(): FormGroup {
    const itemGroup = this.fb.group({
      itemId: [null, [Validators.required]],
      sellerUid: [null, []],
      description: ['', []],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required]],
      discount: [0, []],
      accountId: ['', [Validators.required, Validators.minLength(1)]],
      taxRate: ['08', [Validators.required, , Validators.minLength(1)]],
    });

    this.setupItemGroupValueChangeListener(itemGroup); // Set up listeners immediately

    return itemGroup;
  }

  addPurchaseOrderItem(): void {
    this.purchaseOrderItems.push(this.createPurchaseOrderItemFormGroup());
    this.formNewPurchaseOrderService.calculateTotals(this.purchaseOrderItems);
  }

  removePurchaseOrderItem(index: number): void {
    this.purchaseOrderItems.removeAt(index);
    this.formNewPurchaseOrderService.calculateTotals(this.purchaseOrderItems);
  }

  setupItemGroupValueChangeListener(itemGroup: FormGroup): void {
    // Only subscribe once per itemGroup, not per itemId, etc.
    itemGroup.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(
          (value) =>
            value.quantity !== null &&
            value.price !== null &&
            value.discount !== null
        ) // Only calculate if essential values are present
      )
      .subscribe(() => {
        this.formNewPurchaseOrderService.calculateTotals(
          this.purchaseOrderItems
        );
      });
  }

  onItemSelectedInRow(selectedItem: any, rowIndex: number): void {
    const itemGroup = this.purchaseOrderItems.at(rowIndex) as FormGroup;

    if (itemGroup && selectedItem) {
      // The itemId is already set by the CVA via formControlName="itemId"
      // Now, update the other related controls in this specific row
      itemGroup.patchValue({
        description: selectedItem.description || '',
        price: selectedItem.salePrice ?? 0,
        accountId: selectedItem.saleAccountId ?? '',
        // You might also want to update taxRate if it's tied to the item
        // taxRate: selectedItem.taxRateCode ?? '08',
      });

      // Recalculate totals after patching values
      this.formNewPurchaseOrderService.calculateTotals(this.purchaseOrderItems);
    }
  }

  // ==== END PURCHASE-ORDER ITEMS =====
  onCustomSubmitBtnClicked(action: string): void {
    this.callToAction(action);
  }

  callToAction(action: string): void {
    this.formErrorService.throwFormErrors(this.newPurchaseOrderForm);

    if (
      !this.formNewPurchaseOrderService.verifyPurchaseOrderItems(
        this.purchaseOrderItems
      )
    ) {
      this.customToastService.add({
        message: 'Uno o más items tienen error.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (!this.newPurchaseOrderForm.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.newPurchaseOrderForm.invalid) {
      this.formErrorService.throwFormErrors(this.newPurchaseOrderForm);

      return;
    }

    const data: IDataToCreatePurchaseOrder = this.newPurchaseOrderForm.value;
    data.createdAt = formatDateToString(new Date());

    switch (action) {
      case NewPurchaseOrderFormAction.SAVE:
        data.status = StatusPurchaseOrder.DRAFT;
        data.action = NewPurchaseOrderFormAction.SAVE;
        this.formNewPurchaseOrderService.onSaveAction(data);
        break;
      case NewPurchaseOrderFormAction.MARK_AS_SENT:
        data.status = StatusPurchaseOrder.SENT;
        data.action = NewPurchaseOrderFormAction.MARK_AS_SENT;
        this.formNewPurchaseOrderService.onSaveAction(data);
        break;
      case NewPurchaseOrderFormAction.SEND:
        data.status = StatusPurchaseOrder.DRAFT;
        data.action = NewPurchaseOrderFormAction.SEND;
        this.formNewPurchaseOrderService.handleCreateOrEditPurchaseOrderSendingEmailAsWell(
          data
        );
        break;

      default:
        break;
    }
  }

  // --------- HELPERS ----------
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-purchase-orders');
  }
}
