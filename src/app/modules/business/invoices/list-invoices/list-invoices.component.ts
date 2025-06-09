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
  // public totalSent = signal<number>(0);
  // public totalAccepted = signal<number>(0);
  // public totalDeclined = signal<number>(0);
  // public totalInvoiced = signal<number>(0);

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

  ngOnInit(): void {
    this.fetchAllItems();
  }

  fetchAllItems(): void {
    this.filters.set({ ...this.filters(), status: this.invoiceStatusFilter() });

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
    // this.totalSent.set(statusCounts[StatusInvoice.SENT] ?? 0);
    // this.totalAccepted.set(statusCounts[StatusInvoice.ACCEPTED] ?? 0);
    // this.totalDeclined.set(statusCounts[StatusInvoice.DECLINED] ?? 0);
    // this.totalInvoiced.set(statusCounts[StatusInvoice.INVOICED] ?? 0);
  }

  // FILTERS
  openCloseFilters(): void {
    this.filtersOpen.set(!this.filtersOpen());
  }

  onTabChange(event: MatTabChangeEvent): void {
    const statusByIndex = [
      '',
      StatusInvoice.DRAFT,
      StatusInvoice.SENT,
      // StatusInvoice.DECLINED,
      // StatusInvoice.ACCEPTED,
      // StatusInvoice.INVOICED,
    ];
    this.invoiceStatusFilter.set(statusByIndex[event.index]);

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
