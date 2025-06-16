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
  QuoteService,
} from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { FormNewQuoteService } from '../form-new-quote.service';

import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { QuickDatePickerComponent } from '../../../../shared/components/quick-date-picker/quick-date-picker.component';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import {
  taxRateArray,
  formatDateForInput,
  formatDateToString,
} from '../../../../shared/helpers';

import {
  TypeMessageToast,
  EditQuoteFormAction,
  StatusQuote,
  NameEntities,
} from '../../../../enums';
import {
  ShortAuth,
  ICodeLabel,
  ICommonSelect,
  IAccount,
  IQuote,
  IDataToUpdateQuote,
  IDataEntity,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'edit-quote',
  standalone: true,
  imports: [
    CommonModule,
    CustomSelectComponent,
    ReactiveFormsModule,
    NgSelectModule,
    QuickDatePickerComponent,
    SubmitButtonComponent,
    BreadcrumbComponent,
    TrackingEntityComponent,
  ],
  templateUrl: './edit-quote.component.html',
  styleUrl: './edit-quote.component.scss',
})
export default class EditQuoteComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private commonAdminService = inject(CommonAdminService);
  private quoteService = inject(QuoteService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  public entityData = signal<IDataEntity | null>(null);

  // FORM
  public quoteId = signal<number | null>(null);
  public quote = signal<IQuote | null>(null);
  public formNewQuoteService = inject(FormNewQuoteService);
  public isFormSubmitting = computed(() =>
    this.formNewQuoteService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public editQuoteForm = signal<FormGroup | null>(null);

  // TOTALS
  public subtotal = computed(() => this.formNewQuoteService.subtotal());
  public totalDiscount = computed(() =>
    this.formNewQuoteService.totalDiscount()
  );
  public totalTax = computed(() => this.formNewQuoteService.totalTax());
  public totalAmount = computed(() => this.formNewQuoteService.totalAmount());

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
    this.quoteId.set(this.activatedRoute.snapshot.params['id']);
    this.entityData.set({
      refEntity: NameEntities.QUOTE,
      refEntityId: this.quoteId()!,
    });
  }

  ngOnInit(): void {
    this.fetchAllShortClients();
    this.fetchSellers();
    this.fetchAccounts();
    this.fetchQuoteById();
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

  fetchQuoteById(): void {
    this.quoteService
      .fetchOne(this.quoteId()!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((quote) => {
        if (quote && quote.id) {
          this.quote.set(quote);
          this.fillOutQuoteForm();
        }
      });
  }

  fillOutQuoteForm(): void {
    const quoteData = this.quote()!; // Get the fetched quote

    const quoteItemsFormArray = this.fb.array(
      quoteData.quoteItems.map((item) => {
        // Map the backend QuoteItem object to the form group's expected structure
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
          id: item.id, // Include the existing quote item ID for backend updates
        };
        // No need to pass 'isEditing' flag now, CustomSelect handles the number directly
        const itemGroup = this.createQuoteItemFormGroup(); // Use the existing create method
        itemGroup.patchValue(formGroupValue);
        return itemGroup;
      })
    );

    this.editQuoteForm.set(
      this.fb.group({
        // For 'client', if `ng-select` handles objects with `compareWith`, keep it as object.
        // Otherwise, you might need to use `quoteData.client.id` if the formControlName="client" expects just an ID.
        client: [quoteData.client, [Validators.required]],
        initDate: [
          formatDateForInput(new Date(quoteData.initDate ?? new Date())),
          [Validators.required],
        ],
        expireDate: [
          formatDateForInput(new Date(quoteData.expireDate ?? new Date())),
          [],
        ],
        currency: [quoteData.currency ?? 'USD', [Validators.required]],
        terms: [quoteData.terms ?? '', []],
        quoteItems: quoteItemsFormArray,
      })
    );

    // Set up listeners for all existing quote item rows AFTER the form is built
    // This loop can now be here as the controls are pushed
    this.quoteItems.controls.forEach((control) => {
      this.setupItemGroupValueChangeListener(control as FormGroup);
    });

    if (this.quoteItems && this.quoteItems.controls) {
      this.formNewQuoteService.calculateTotals(this.quoteItems);
    }
  }

  validField(controlPath: string): boolean {
    const control = this.editQuoteForm()?.get(controlPath);
    if (!control) return false;
    return control.touched && control.invalid;
  }

  onExpireDateChange(value: any): void {
    this.editQuoteForm()?.controls['expireDate'].patchValue(value);
  }

  // ==== QUOTE ITEMS =====
  get quoteItems(): FormArray {
    return this.editQuoteForm()?.get('quoteItems') as FormArray;
  }

  createQuoteItemFormGroup(): FormGroup {
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

  addQuoteItem(): void {
    this.quoteItems.push(this.createQuoteItemFormGroup());
    this.formNewQuoteService.calculateTotals(this.quoteItems);
  }

  removeQuoteItem(index: number): void {
    this.quoteItems.removeAt(index);
    this.formNewQuoteService.calculateTotals(this.quoteItems);
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
        const formArray = this.quoteItems;
        if (formArray) {
          this.formNewQuoteService.calculateTotals(formArray);
        }
      });
  }

  onItemSelectedInRow(selectedItem: any, rowIndex: number): void {
    const itemGroup = this.quoteItems.at(rowIndex) as FormGroup;

    if (itemGroup && selectedItem) {
      // The itemId is already set by the CVA via formControlName="itemId"
      // Now, update the other related controls in this specific row
      itemGroup.patchValue({
        description:
          this.formNewQuoteService.getCorrectDescriptionFromItemSelectedEmitter(
            this.quote(),
            selectedItem
          ),
        price: this.formNewQuoteService.getCorrectPriceFromItemSelectedEmitter(
          this.quote(),
          selectedItem
        ),
        accountId:
          this.formNewQuoteService.getCorrectAccountFromItemSelectedEmitter(
            this.quote(),
            selectedItem
          ),
      });

      // Recalculate totals after patching values
      this.formNewQuoteService.calculateTotals(this.quoteItems);
    }
  }

  // ==== END QUOTE ITEMS =====
  onCustomSubmitBtnClicked(action: string): void {
    this.callToAction(action);
  }

  callToAction(action: string): void {
    this.formErrorService.throwFormErrors(this.editQuoteForm()!);

    if (!this.formNewQuoteService.verifyQuoteItems(this.quoteItems)) {
      this.customToastService.add({
        message: 'Uno o más items tienen error.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (!this.editQuoteForm()!.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.editQuoteForm()!.invalid) {
      this.formErrorService.throwFormErrors(this.editQuoteForm()!);

      return;
    }

    const data: IDataToUpdateQuote = this.editQuoteForm()!.value;
    data.updatedAt = formatDateToString(new Date());

    if (action === EditQuoteFormAction.EDIT) {
      this.formNewQuoteService.onEditAction(this.quoteId()!, data);
    }

    if (action === EditQuoteFormAction.EDIT_AND_SEND) {
      if (this.quote()?.status === StatusQuote.DRAFT) {
        data.status = StatusQuote.SENT;
      }
      this.formNewQuoteService.handleCreateOrEditQuoteSendingEmailAsWell(
        data,
        this.quoteId()
      );
    }
  }

  // --------- HELPERS ----------
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-quotes');
  }
}
