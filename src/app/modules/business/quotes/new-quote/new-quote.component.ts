import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
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
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgSelectModule } from '@ng-select/ng-select';

import { AuthService, ItemService, ClientService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { FormNewQuoteService } from '../form-new-quote.service';

import { QuickDatePickerComponent } from '../../../../shared/components/quick-date-picker/quick-date-picker.component';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import {
  taxRateArray,
  formatDateForInput,
  formatDateToString,
} from '../../../../shared/helpers';

import {
  TypeMessageToast,
  NewQuoteFormAction,
  StatusQuote,
} from '../../../../enums';
import {
  IItemForSelect,
  ShortAuth,
  ICodeLabel,
  ICommonSelect,
  IDataToCreateQuote,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-quote',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    QuickDatePickerComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './new-quote.component.html',
  styleUrl: './new-quote.component.scss',
})
export default class NewQuoteComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private location = inject(Location);
  private router = inject(Router);
  private authService = inject(AuthService);
  private itemService = inject(ItemService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // ITEMS
  public items = signal<IItemForSelect[]>([]);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // FORM
  public formNewQuoteService = inject(FormNewQuoteService);
  public isFormSubmitting = computed(() =>
    this.formNewQuoteService.isFormSubmitting()
  );
  public taxRates: ICodeLabel[] = taxRateArray;
  public clients = signal<ICommonSelect[]>([]);
  public newQuoteForm: FormGroup = this.fb.group({
    client: [null, [Validators.required]],
    initDate: [this.currentDate, [Validators.required]],
    expireDate: [this.dateInSevenDay, []],
    currency: ['USD', [Validators.required]],
    terms: ['', []],
    quoteItems: this.fb.array([
      this.fb.group({
        itemId: ['', [Validators.required]],
        sellerUid: [null, []],
        description: ['', []],
        quantity: [1, [Validators.required, Validators.min(1)]],
        price: ['', [Validators.required]],
        discount: [0, []],
        account: ['200', [Validators.required]],
        taxRate: ['08', [Validators.required]],
      }),
      this.fb.group({
        itemId: ['', [Validators.required]],
        sellerUid: [null, []],
        description: ['', []],
        quantity: [1, [Validators.required, Validators.min(1)]],
        price: ['', [Validators.required]],
        discount: [0, []],
        account: ['200', [Validators.required]],
        taxRate: ['08', [Validators.required]],
      }),
    ]),
  });

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

  ngOnInit(): void {
    this.fetchAllShortClients();
    this.fetchAllShortItems();
    this.fetchSellers();

    // Set up listener for the initial quote item row
    if (this.quoteItems.controls.length === 2) {
      this.setupItemIdChangeListener(0);
      this.setupItemIdChangeListener(1);
    }

    // Set up listeners for all existing quote item rows at the beginning
    this.quoteItems.controls.forEach((control) => {
      this.setupItemGroupValueChangeListener(control as FormGroup);
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

  fetchAllShortItems(): void {
    this.itemService
      .fetchAllForSelect()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.length) {
          this.items.set(resp);
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
    const control = this.newQuoteForm.get(controlPath);
    if (!control) return false;

    return control.touched && control.invalid;
  }

  onExpireDateChange(value: any): void {
    this.newQuoteForm.controls['expireDate'].patchValue(value);
  }

  // ==== QUOTE ITEMS =====
  get quoteItems(): FormArray {
    return this.newQuoteForm.get('quoteItems') as FormArray;
  }

  addQuoteItem(): void {
    const itemGroup = this.fb.group({
      itemId: ['', [Validators.required]],
      sellerUid: [null, []],
      description: ['', []],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required]],
      discount: [0, []],
      account: ['200', [Validators.required]],
      taxRate: ['08', [Validators.required]],
    });

    this.quoteItems.push(itemGroup);
    this.setupItemIdChangeListener(this.quoteItems.length - 1);
    this.setupItemGroupValueChangeListener(itemGroup);
  }

  removeQuoteItem(index: number): void {
    this.quoteItems.removeAt(index);
    this.formNewQuoteService.calculateTotals(this.quoteItems);
  }

  setupItemGroupValueChangeListener(itemGroup: FormGroup): void {
    itemGroup.controls['quantity'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => {
        this.formNewQuoteService.calculateTotals(this.quoteItems);
      });
    itemGroup.controls['price'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => {
        this.formNewQuoteService.calculateTotals(this.quoteItems);
      });
    itemGroup.controls['discount'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => {
        this.formNewQuoteService.calculateTotals(this.quoteItems);
      });
    itemGroup.controls['taxRate'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => {
        this.formNewQuoteService.calculateTotals(this.quoteItems);
      });
  }

  setupItemIdChangeListener(index: number): void {
    const itemGroup = this.quoteItems.controls[index] as FormGroup;
    const itemIdControl = itemGroup.controls['itemId'];

    itemIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedItemId) => {
        if (selectedItemId) {
          const selectedItem = this.items().find(
            (item) => item.id === +selectedItemId
          ); // Find the selected item from your items array

          if (selectedItem) {
            itemGroup.controls['price'].patchValue(selectedItem.salePrice);
            itemGroup.controls['description'].patchValue(
              selectedItem.saleDescription
            );
          } else {
            itemGroup.controls['price'].reset();
            itemGroup.controls['description'].reset();
          }

          this.formNewQuoteService.calculateTotals(this.quoteItems);
        } else {
          itemGroup.controls['price'].reset();
          itemGroup.controls['description'].reset();
        }
      });
  }
  // ==== END QUOTE ITEMS =====
  onCustomSubmitBtnClicked(action: string): void {
    this.callToAction(action);
  }

  callToAction(action: string): void {
    if (!this.formNewQuoteService.verifyQuoteItems(this.quoteItems)) {
      this.customToastService.add({
        message: 'Uno o más items tienen error.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (!this.newQuoteForm.controls['client'].value) {
      this.customToastService.add({
        message: 'Seleccione un cliente para continuar.',
        type: TypeMessageToast.ERROR,
        duration: 6000,
      });

      return;
    }

    if (this.newQuoteForm.invalid) {
      this.formErrorService.throwFormErrors(this.newQuoteForm);

      return;
    }

    const data: IDataToCreateQuote = this.newQuoteForm.value;
    data.createdAt = formatDateToString(new Date());

    switch (action) {
      case NewQuoteFormAction.SAVE:
        data.status = StatusQuote.DRAFT;
        data.action = NewQuoteFormAction.SAVE;
        this.formNewQuoteService.onSaveAction(data);
        break;
      case NewQuoteFormAction.MARK_AS_SENT:
        data.status = StatusQuote.SENT;
        data.action = NewQuoteFormAction.MARK_AS_SENT;
        this.formNewQuoteService.onSaveAction(data);
        break;
      case NewQuoteFormAction.SEND:
        data.status = StatusQuote.DRAFT;
        data.action = NewQuoteFormAction.SEND;
        this.formNewQuoteService.handleCreateNewQuoteSendingEmailAsWell(data);
        break;

      default:
        break;
    }
  }

  // --------- HELPERS ----------
  public comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-quotes');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
