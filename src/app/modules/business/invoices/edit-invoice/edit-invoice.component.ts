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
import { ClientService, AccountService, InvoiceService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { FormInvoiceService } from '../form-invoice.service';

import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { QuickDatePickerComponent } from '../../../../shared/components/quick-date-picker/quick-date-picker.component';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';

import {
  taxRateArray,
  formatDateForInput,
  formatDateToString,
} from '../../../../shared/helpers';

import {
  TypeMessageToast,
  EditInvoiceFormAction,
  StatusInvoice,
  NameEntities,
} from '../../../../enums';
import {
  ShortAuth,
  ICodeLabel,
  ICommonSelect,
  IAccount,
  IInvoice,
  IDataToUpdateInvoice,
  IDataEntity,
  IClientEconomicActivity,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'edit-invoice',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    CustomSelectComponent,
    ReactiveFormsModule,
    NgSelectModule,
    QuickDatePickerComponent,
    SubmitButtonComponent,
    TrackingEntityComponent,
  ],
  templateUrl: './edit-invoice.component.html',
  styleUrl: './edit-invoice.component.scss',
})
export default class EditInvoiceComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);

  private accountService = inject(AccountService);
  private commonAdminService = inject(CommonAdminService);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  public entityData = signal<IDataEntity | null>(null);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  // ECONOMIC ACTIVITIES
  public economicActivities = signal<IClientEconomicActivity[]>([]);

  // FORM
  public invoiceId = signal<number | null>(null);
  public invoice = signal<IInvoice | null>(null);
  public formInvoiceService = inject(FormInvoiceService);
  public isFormSubmitting = computed(() =>
    this.formInvoiceService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public editInvoiceForm = signal<FormGroup | null>(null);

  // TOTALS
  public subtotal = computed(() => this.formInvoiceService.subtotal());
  public totalDiscount = computed(() =>
    this.formInvoiceService.totalDiscount()
  );
  public totalTax = computed(() => this.formInvoiceService.totalTax());
  public totalAmount = computed(() => this.formInvoiceService.totalAmount());

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
    this.invoiceId.set(this.activatedRoute.snapshot.params['id']);
    this.entityData.set({
      refEntity: NameEntities.QUOTE,
      refEntityId: this.invoiceId()!,
    });
  }

  ngOnInit(): void {
    this.fetchAllShortClients();
    // this.fetchSellers();
    this.fetchAccounts();
    this.fetchInvoiceById();
  }

  setUpListenerClientField(): void {
    this.editInvoiceForm()
      ?.get('client')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedClient) => {
        if (selectedClient) {
          this.fetchEconomicActivities(selectedClient.id);
        } else {
          this.economicActivities.set([]);
          this.editInvoiceForm()?.controls['receptorActivities'].patchValue('');
        }
      });
  }

  fetchEconomicActivities(clientId: number): void {
    this.clientService
      .findEconomicActivities(clientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((activities) => {
        if (activities && activities.length > 0) {
          this.economicActivities.set(activities);
        } else {
          this.economicActivities.set([]);
          this.editInvoiceForm()?.controls['receptorActivities'].patchValue('');
        }
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

  // fetchSellers(): void {
  //   this.authService.fetchAllSellers().subscribe((resp) => {
  //     if (resp && resp.length) {
  //       this.sellers.set(resp);
  //     }
  //   });
  // }

  fetchInvoiceById(): void {
    this.invoiceService
      .fetchOne(this.invoiceId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((invoice) => {
        if (invoice && invoice.id) {
          this.invoice.set(invoice);
          this.fillOutInvoiceForm();
        }
      });
  }

  fillOutInvoiceForm(): void {
    const invoiceData = this.invoice()!; // Get the fetched invoice

    this.fetchEconomicActivities(invoiceData.client.id);

    const invoiceItemsFormArray = this.fb.array(
      invoiceData.invoiceItems.map((item) => {
        // Map the backend InvoiceItem object to the form group's expected structure
        const formGroupValue = {
          // itemId will be the NUMBER ID, which CustomSelectComponent now handles
          itemId: item.item.id,
          // sellerUid: item.seller?.uid || null,
          description: item.description ?? '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount ?? 0,
          accountId: item.account?.id,
          taxRate: item.taxRate ?? '08',
          id: item.id, // Include the existing invoice item ID for backend updates
        };
        // No need to pass 'isEditing' flag now, CustomSelect handles the number directly
        const itemGroup = this.createInvoiceItemFormGroup(); // Use the existing create method
        itemGroup.patchValue(formGroupValue);
        return itemGroup;
      })
    );

    this.editInvoiceForm.set(
      this.fb.group({
        // For 'client', if `ng-select` handles objects with `compareWith`, keep it as object.
        // Otherwise, you might need to use `invoiceData.client.id` if the formControlName="client" expects just an ID.
        client: [invoiceData.client, [Validators.required]],
        initDate: [
          formatDateForInput(new Date(invoiceData.initDate ?? new Date())),
          [Validators.required],
        ],
        expireDate: [
          formatDateForInput(new Date(invoiceData.expireDate ?? new Date())),
          [],
        ],
        currency: [invoiceData.currency ?? 'USD', [Validators.required]],
        receptorActivities: [invoiceData.receptorActivities, []],
        reference: [invoiceData.reference ?? '', []],
        invoiceItems: invoiceItemsFormArray,
      })
    );

    // Set up listeners for all existing invoice item rows AFTER the form is built
    // This loop can now be here as the controls are pushed
    this.invoiceItems.controls.forEach((control) => {
      this.setupItemGroupValueChangeListener(control as FormGroup);
    });

    if (this.invoiceItems && this.invoiceItems.controls) {
      this.formInvoiceService.calculateTotals(this.invoiceItems);
    }

    this.setUpListenerClientField();
  }

  validField(controlPath: string): boolean {
    const control = this.editInvoiceForm()?.get(controlPath);
    if (!control) return false;
    return control.touched && control.invalid;
  }

  onExpireDateChange(value: any): void {
    this.editInvoiceForm()?.controls['expireDate'].patchValue(value);
  }

  // ==== INVOICE ITEMS =====
  get invoiceItems(): FormArray {
    return this.editInvoiceForm()?.get('invoiceItems') as FormArray;
  }

  createInvoiceItemFormGroup(): FormGroup {
    const itemGroup = this.fb.group({
      id: [null], // Add id control for existing items (will be null for new items)
      itemId: [null, [Validators.required]],
      // sellerUid: [null, []],
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

  addInvoiceItem(): void {
    this.invoiceItems.push(this.createInvoiceItemFormGroup());
    this.formInvoiceService.calculateTotals(this.invoiceItems);
  }

  removeInvoiceItem(index: number): void {
    this.invoiceItems.removeAt(index);
    this.formInvoiceService.calculateTotals(this.invoiceItems);
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
        const formArray = this.invoiceItems;
        if (formArray) {
          this.formInvoiceService.calculateTotals(formArray);
        }
      });
  }

  onItemSelectedInRow(selectedItem: any, rowIndex: number): void {
    const itemGroup = this.invoiceItems.at(rowIndex) as FormGroup;

    if (itemGroup && selectedItem) {
      // The itemId is already set by the CVA via formControlName="itemId"
      // Now, update the other related controls in this specific row
      itemGroup.patchValue({
        description:
          this.formInvoiceService.getCorrectDescriptionFromItemSelectedEmitter(
            this.invoice(),
            selectedItem
          ),
        price: this.formInvoiceService.getCorrectPriceFromItemSelectedEmitter(
          this.invoice(),
          selectedItem
        ),
        accountId:
          this.formInvoiceService.getCorrectAccountFromItemSelectedEmitter(
            this.invoice(),
            selectedItem
          ),
      });

      // Recalculate totals after patching values
      this.formInvoiceService.calculateTotals(this.invoiceItems);
    }
  }

  // ==== END INVOICE ITEMS =====
  onCustomSubmitBtnClicked(action: string): void {
    this.callToAction(action);
  }

  callToAction(action: string): void {
    this.formErrorService.throwFormErrors(this.editInvoiceForm()!);

    if (!this.formInvoiceService.verifyInvoiceItems(this.invoiceItems)) {
      this.customToastService.add({
        message: 'Uno o más items tienen error.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (!this.editInvoiceForm()!.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.editInvoiceForm()!.invalid) {
      this.formErrorService.throwFormErrors(this.editInvoiceForm()!);

      return;
    }

    const data: IDataToUpdateInvoice = this.editInvoiceForm()!.value;
    data.updatedAt = formatDateToString(new Date());

    if (action === EditInvoiceFormAction.EDIT) {
      this.formInvoiceService.onEditAction(this.invoiceId()!, data);
    }

    if (action === EditInvoiceFormAction.EDIT_AND_SEND) {
      if (this.invoice()?.status === StatusInvoice.DRAFT) {
        data.status = StatusInvoice.SENT;
      }
      this.formInvoiceService.handleCreateOrEditInvoiceSendingEmailAsWell(
        data,
        this.invoiceId()
      );
    }
  }

  // --------- HELPERS ----------
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-invoices');
  }
}
