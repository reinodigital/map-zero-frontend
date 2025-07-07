import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { InvoiceService } from '../../../../api';
import { DetailInvoiceService } from '../detail-invoice.service';
import { ListInvoicesService } from '../list-invoices.service';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { LimitValues, StatusInvoice } from '../../../../enums';
import { IInvoice } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-invoices',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    PaginationComponent,
    RouterLink,
    ReadableDatePipe,
    BreadcrumbComponent,
  ],
  templateUrl: './list-invoices.component.html',
  styleUrl: './list-invoices.component.scss',
})
export default class ListInvoicesComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private invoiceService = inject(InvoiceService);
  public detailInvoiceService = inject(DetailInvoiceService);
  public listInvoicesService = inject(ListInvoicesService);

  // INVOICE
  public invoices = signal<IInvoice[]>([]);

  // PAGINATION
  public limit: number = LimitValues.TEN;
  public offset = computed<number>(() =>
    this.listInvoicesService.lastOffsetInvoicesList()
  );
  public total = signal<number>(0);
  public isLoading = signal<boolean>(true);

  // TOTALS STATUS
  public totalAll = signal<number>(0);
  public totalDraft = signal<number>(0);
  public totalAwaitingApproval = signal<number>(0);
  public totalAwaitingPayment = signal<number>(0);
  public totalPaid = signal<number>(0);

  // FILTERS
  public invoiceStatusFilter = signal<string>('');
  public filtersOpen = signal<boolean>(false);
  public filters = signal<any>({});
  public isActiveFilters = signal<boolean>(false);
  public searchForm = signal<FormGroup>(
    this.fb.group({
      invoiceNumber: ['', []],
    })
  );

  // TABS
  public selectedTabIndex = signal<number>(0);
  private statusByIndexMap: Record<number, string> = {
    0: '', // 'Todas'
    1: StatusInvoice.DRAFT,
    2: StatusInvoice.AWAITING_APPROVAL,
    3: StatusInvoice.AWAITING_PAYMENT,
    4: StatusInvoice.PAID,
  };

  ngOnInit(): void {
    this.fetchAllItems();
  }

  fetchAllItems(): void {
    this.filters.set({
      ...this.filters(),
      status: this.statusByIndexMap[this.selectedTabIndex()],
    });

    this.invoiceService
      .fetchAll(this.limit, this.offset(), this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.invoices.set(resp.invoices);

          // status
          this.totalAll.set(resp.total);
          this.fillOutStatusInvoice(resp.statusCounts ?? null);
        }

        this.isLoading.set(false);
      });
  }

  // FILL OUT STATUS
  fillOutStatusInvoice(statusCounts: Record<string, number> | null): void {
    if (!statusCounts) return;

    this.totalDraft.set(statusCounts[StatusInvoice.DRAFT] ?? 0);
    this.totalAwaitingApproval.set(
      statusCounts[StatusInvoice.AWAITING_APPROVAL] ?? 0
    );
    this.totalAwaitingPayment.set(
      statusCounts[StatusInvoice.AWAITING_PAYMENT] ?? 0
    );
    this.totalPaid.set(statusCounts[StatusInvoice.PAID] ?? 0);
  }

  // FILTERS
  openCloseFilters(): void {
    this.filtersOpen.set(!this.filtersOpen());
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex.set(event.index);

    this.listInvoicesService.lastOffsetInvoicesList.set(0);
    this.fetchAllItems();
  }

  searchFormSubmit(): void {
    this.filters.set(this.searchForm().value);

    // Set offset to 0 to allow pagination by filters
    this.listInvoicesService.lastOffsetInvoicesList.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllItems();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listInvoicesService.lastOffsetInvoicesList.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.selectedTabIndex.set(0);
    this.searchForm().reset();
    this.fetchAllItems();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listInvoicesService.lastOffsetInvoicesList.set(offset);

    this.fetchAllItems();
  }
}
