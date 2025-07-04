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
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgSelectModule } from '@ng-select/ng-select';

import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import {
  AuthService,
  ClientService,
  AccountService,
  PurchaseOrderService,
} from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { FormNewPurchaseOrderService } from '../form-new-purchase-order.service';

import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import {
  taxRateArray,
  formatDateForInput,
  formatDateToString,
} from '../../../../shared/helpers';

import {
  TypeMessageToast,
  NameEntities,
  EditPurchaseOrderFormAction,
  StatusPurchaseOrder,
} from '../../../../enums';
import {
  ShortAuth,
  ICodeLabel,
  ICommonSelect,
  IAccount,
  IDataEntity,
  IPurchaseOrder,
  IDataToUpdatePurchaseOrder,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'edit-purchase-order',
  standalone: true,
  imports: [
    CommonModule,
    CustomSelectComponent,
    ReactiveFormsModule,
    NgSelectModule,
    SubmitButtonComponent,
    BreadcrumbComponent,
    TrackingEntityComponent,
  ],
  templateUrl: './edit-purchase-order.component.html',
  styleUrl: './edit-purchase-order.component.scss',
})
export default class EditPurchaseOrderComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private commonAdminService = inject(CommonAdminService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  public entityData = signal<IDataEntity | null>(null);

  // FORM
  public purchaseOrderId = signal<number | null>(null);
  public purchaseOrder = signal<IPurchaseOrder | null>(null);
  public formNewPurchaseOrderService = inject(FormNewPurchaseOrderService);
  public isFormSubmitting = computed(() =>
    this.formNewPurchaseOrderService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public editPurchaseOrderForm = signal<FormGroup | null>(null);

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

  get dateInSevenDay(): string {
    const now = new Date();
    const in7Days = new Date(new Date().setDate(now.getDate() + 7));
    return formatDateForInput(in7Days);
  }

  constructor() {
    this.purchaseOrderId.set(this.activatedRoute.snapshot.params['id']);
    this.entityData.set({
      refEntity: NameEntities.PURCHASE_ORDER,
      refEntityId: this.purchaseOrderId()!,
    });
  }

  ngOnInit(): void {
    this.fetchAllShortClients();
    this.fetchSellers();
    this.fetchAccounts();
    this.fetchPurchaseOrderById();
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

  fetchPurchaseOrderById(): void {
    this.purchaseOrderService
      .fetchOne(this.purchaseOrderId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((purchaseOrder) => {
        if (purchaseOrder && purchaseOrder.id) {
          this.purchaseOrder.set(purchaseOrder);
          this.fillOutPurchaseOrderForm();
        }
      });
  }

  fillOutPurchaseOrderForm(): void {
    const purchaseOrderData = this.purchaseOrder()!; // Get the fetched purchaseOrder

    const purchaseOrderItemsFormArray = this.fb.array(
      purchaseOrderData.purchaseOrderItems.map((item) => {
        // Map the backend PurchaseOrderItem object to the form group's expected structure
        const formGroupValue = {
          // itemId will be the NUMBER ID, which CustomSelectComponent now handles
          itemId: item.item.id,
          sellerUid: item.seller?.uid || null,
          description: item.description ?? '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount ?? 0,
          accountId: item.account?.id,
          taxRate: item.taxRate ?? '08',
          id: item.id, // Include the existing purchase order item ID for backend updates
        };
        // No need to pass 'isEditing' flag now, CustomSelect handles the number directly
        const itemGroup = this.createPurchaseOrderItemFormGroup(); // Use the existing create method
        itemGroup.patchValue(formGroupValue);
        return itemGroup;
      })
    );

    this.editPurchaseOrderForm.set(
      this.fb.group({
        // For 'client', if `ng-select` handles objects with `compareWith`, keep it as object.
        // Otherwise, you might need to use `purchaseOrderData.client.id` if the formControlName="client" expects just an ID.
        client: [purchaseOrderData.client, [Validators.required]],
        initDate: [
          formatDateForInput(
            new Date(purchaseOrderData.initDate ?? new Date())
          ),
          [Validators.required],
        ],
        deliveryDate: [
          formatDateForInput(
            new Date(purchaseOrderData.deliveryDate ?? new Date())
          ),
          [],
        ],
        currency: [purchaseOrderData.currency ?? 'USD', [Validators.required]],
        deliveryInstructions: [
          purchaseOrderData.deliveryInstructions ?? '',
          [],
        ],
        purchaseOrderItems: purchaseOrderItemsFormArray,
      })
    );

    // Set up listeners for all existing purchaseOrder item rows AFTER the form is built
    // This loop can now be here as the controls are pushed
    this.purchaseOrderItems.controls.forEach((control) => {
      this.setupItemGroupValueChangeListener(control as FormGroup);
    });

    if (this.purchaseOrderItems && this.purchaseOrderItems.controls) {
      this.formNewPurchaseOrderService.calculateTotals(this.purchaseOrderItems);
    }
  }

  validField(controlPath: string): boolean {
    const control = this.editPurchaseOrderForm()?.get(controlPath);
    if (!control) return false;
    return control.touched && control.invalid;
  }

  // ==== PURCHASE-ORDER ITEMS =====
  get purchaseOrderItems(): FormArray {
    return this.editPurchaseOrderForm()?.get('purchaseOrderItems') as FormArray;
  }

  createPurchaseOrderItemFormGroup(): FormGroup {
    const itemGroup = this.fb.group({
      id: [null], // Add id control for existing items (will be null for new items)
      itemId: [null, [Validators.required]],
      sellerUid: [null, []],
      description: ['', []],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required]],
      discount: [0, []],
      accountId: ['', [Validators.required, Validators.minLength(1)]],
      taxRate: ['08', [Validators.required, Validators.minLength(1)]],
    });

    this.setupItemGroupValueChangeListener(itemGroup);
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
        const formArray = this.purchaseOrderItems;
        if (formArray) {
          this.formNewPurchaseOrderService.calculateTotals(formArray);
        }
      });
  }

  onItemSelectedInRow(selectedItem: any, rowIndex: number): void {
    const itemGroup = this.purchaseOrderItems.at(rowIndex) as FormGroup;

    if (itemGroup && selectedItem) {
      // The itemId is already set by the CVA via formControlName="itemId"
      // Now, update the other related controls in this specific row
      itemGroup.patchValue({
        description:
          this.formNewPurchaseOrderService.getCorrectDescriptionFromItemSelectedEmitter(
            this.purchaseOrder(),
            selectedItem
          ),
        price:
          this.formNewPurchaseOrderService.getCorrectPriceFromItemSelectedEmitter(
            this.purchaseOrder(),
            selectedItem
          ),
        accountId:
          this.formNewPurchaseOrderService.getCorrectAccountFromItemSelectedEmitter(
            this.purchaseOrder(),
            selectedItem
          ),
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
    this.formErrorService.throwFormErrors(this.editPurchaseOrderForm()!);

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

    if (!this.editPurchaseOrderForm()!.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.editPurchaseOrderForm()!.invalid) {
      this.formErrorService.throwFormErrors(this.editPurchaseOrderForm()!);

      return;
    }

    const data: IDataToUpdatePurchaseOrder =
      this.editPurchaseOrderForm()!.value;
    data.updatedAt = formatDateToString(new Date());

    if (action === EditPurchaseOrderFormAction.EDIT) {
      this.formNewPurchaseOrderService.onEditAction(
        this.purchaseOrderId()!,
        data
      );
    }

    if (action === EditPurchaseOrderFormAction.EDIT_AND_SEND) {
      if (this.purchaseOrder()?.status === StatusPurchaseOrder.DRAFT) {
        data.status = StatusPurchaseOrder.SENT;
      }
      this.formNewPurchaseOrderService.handleCreateOrEditPurchaseOrderSendingEmailAsWell(
        data,
        this.purchaseOrderId()
      );
    }
  }

  // --------- HELPERS ----------
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-purchase-order');
  }
}
