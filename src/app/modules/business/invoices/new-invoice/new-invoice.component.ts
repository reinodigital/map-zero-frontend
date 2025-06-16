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
  InvoiceFormAction,
  StatusInvoice,
  TypeMessageToast,
} from '../../../../enums';
import {
  ICodeLabel,
  ICommonSelect,
  IAccount,
  IDataToCreateInvoice,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-invoice',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    CustomSelectComponent,
    ReactiveFormsModule,
    NgSelectModule,
    QuickDatePickerComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './new-invoice.component.html',
  styleUrl: './new-invoice.component.scss',
})
export default class NewInvoiceComponent implements OnInit {
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

  // // SELLERS
  // public sellers = signal<ShortAuth[]>([]);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  // FORM
  public formInvoiceService = inject(FormInvoiceService);
  public isFormSubmitting = computed(() =>
    this.formInvoiceService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public newInvoiceForm: FormGroup = this.fb.group({
    client: [null, [Validators.required]],
    initDate: [this.currentDate, [Validators.required]],
    expireDate: [this.dateInSevenDay, []],
    currency: ['USD', [Validators.required]],
    reference: ['', []],
    invoiceItems: this.fb.array([
      this.createInvoiceItemFormGroup(),
      this.createInvoiceItemFormGroup(),
    ]),
  });

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

  ngOnInit(): void {
    this.formInvoiceService.cleanTotalValues();
    this.fetchAllShortClients();
    // this.fetchSellers();
    this.fetchAccounts();

    // Set up listeners for all existing invoice item rows at the beginning
    this.invoiceItems.controls.forEach((control) => {
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

  // fetchSellers(): void {
  //   this.authService.fetchAllSellers().subscribe((resp) => {
  //     if (resp && resp.length) {
  //       this.sellers.set(resp);
  //     }
  //   });
  // }

  validField(controlPath: string): boolean {
    const control = this.newInvoiceForm.get(controlPath);
    if (!control) return false;
    return control.touched && control.invalid;
  }

  onExpireDateChange(value: any): void {
    this.newInvoiceForm.controls['expireDate'].patchValue(value);
  }

  // ==== INVOICE ITEMS =====
  get invoiceItems(): FormArray {
    return this.newInvoiceForm.get('invoiceItems') as FormArray;
  }

  createInvoiceItemFormGroup(): FormGroup {
    const itemGroup = this.fb.group({
      itemId: [null, [Validators.required]],
      // sellerUid: [null, []],
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
        this.formInvoiceService.calculateTotals(this.invoiceItems);
      });
  }

  onItemSelectedInRow(selectedItem: any, rowIndex: number): void {
    const itemGroup = this.invoiceItems.at(rowIndex) as FormGroup;

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
      this.formInvoiceService.calculateTotals(this.invoiceItems);
    }
  }

  // ==== END INVOICE ITEMS =====
  onCustomSubmitBtnClicked(action: string): void {
    this.callToAction(action);
  }

  callToAction(action: string): void {
    this.formErrorService.throwFormErrors(this.newInvoiceForm);

    if (!this.formInvoiceService.verifyInvoiceItems(this.invoiceItems)) {
      this.customToastService.add({
        message: 'Uno o más items tienen error.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (!this.newInvoiceForm.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.newInvoiceForm.invalid) return;

    const data: IDataToCreateInvoice = this.newInvoiceForm.value;
    data.createdAt = formatDateToString(new Date());

    switch (action) {
      case InvoiceFormAction.SAVE:
        data.status = StatusInvoice.DRAFT;
        data.action = InvoiceFormAction.SAVE;
        this.formInvoiceService.onSaveAction(data);
        break;
      case InvoiceFormAction.MARK_AS_SENT:
        data.status = StatusInvoice.SENT;
        data.action = InvoiceFormAction.MARK_AS_SENT;
        this.formInvoiceService.onSaveAction(data);
        break;
      case InvoiceFormAction.SEND:
        data.status = StatusInvoice.DRAFT;
        data.action = InvoiceFormAction.SEND;
        this.formInvoiceService.handleCreateOrEditInvoiceSendingEmailAsWell(
          data
        );
        break;

      default:
        break;
    }
  }

  // --------- HELPERS ----------
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-invoices');
  }
}
