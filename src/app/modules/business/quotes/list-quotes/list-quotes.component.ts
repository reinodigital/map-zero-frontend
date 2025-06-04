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

import { DetailQuoteService } from '../detail-quote.service';
import { ListQuotesService } from '../list-quotes.service';
import { QuoteService } from '../../../../api';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { LimitValues, StatusQuote } from '../../../../enums';
import { IQuote } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-quotes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    PaginationComponent,
    RouterLink,
    ReadableDatePipe,
    BreadcrumbComponent,
  ],
  templateUrl: './list-quotes.component.html',
  styleUrl: './list-quotes.component.scss',
})
export default class ListQuotesComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private quoteService = inject(QuoteService);
  public detailQuoteService = inject(DetailQuoteService);
  public listQuotesService = inject(ListQuotesService);

  // QUOTES
  public quotes = signal<IQuote[]>([]);

  // PAGINATION
  public limit: number = LimitValues.TEN;
  public offset = computed<number>(() =>
    this.listQuotesService.lastOffsetQuotesList()
  );
  public total = signal<number>(0);
  public isLoading = signal<boolean>(true);

  // TOTALS STATUS
  public totalAll = signal<number>(0);
  public totalDraft = signal<number>(0);
  public totalSent = signal<number>(0);
  public totalAccepted = signal<number>(0);
  public totalDeclined = signal<number>(0);
  public totalInvoiced = signal<number>(0);

  // FILTERS
  public quoteStatusFilter = signal<string>('');
  public filtersOpen = signal<boolean>(false);
  public filters = signal<any>({});
  public isActiveFilters = signal<boolean>(false);
  public searchForm = signal<FormGroup>(
    this.fb.group({
      quoteNumber: ['', []],
    })
  );

  ngOnInit(): void {
    this.fetchAllItems();
  }

  fetchAllItems(): void {
    this.filters.set({ ...this.filters(), status: this.quoteStatusFilter() });

    this.quoteService
      .fetchAll(this.limit, this.offset(), this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.quotes.set(resp.quotes);

          // status
          this.totalAll.set(resp.total);
          this.fillOutStatusQuote(resp.statusCounts ?? null);
        }

        this.isLoading.set(false);
      });
  }

  // FILL OUT STATUS
  fillOutStatusQuote(statusCounts: Record<string, number> | null): void {
    if (!statusCounts) return;

    this.totalDraft.set(statusCounts[StatusQuote.DRAFT] ?? 0);
    this.totalSent.set(statusCounts[StatusQuote.SENT] ?? 0);
    this.totalAccepted.set(statusCounts[StatusQuote.ACCEPTED] ?? 0);
    this.totalDeclined.set(statusCounts[StatusQuote.DECLINED] ?? 0);
    this.totalInvoiced.set(statusCounts[StatusQuote.INVOICED] ?? 0);
  }

  // FILTERS
  openCloseFilters(): void {
    this.filtersOpen.set(!this.filtersOpen());
  }

  onTabChange(event: MatTabChangeEvent): void {
    const statusByIndex = [
      '',
      StatusQuote.DRAFT,
      StatusQuote.SENT,
      StatusQuote.DECLINED,
      StatusQuote.ACCEPTED,
      StatusQuote.INVOICED,
    ];
    this.quoteStatusFilter.set(statusByIndex[event.index]);

    this.fetchAllItems();
  }

  searchFormSubmit(): void {
    this.filters.set(this.searchForm().value);

    // Set offset to 0 to allow pagination by filters
    this.listQuotesService.lastOffsetQuotesList.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllItems();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listQuotesService.lastOffsetQuotesList.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllItems();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listQuotesService.lastOffsetQuotesList.set(offset);

    this.fetchAllItems();
  }
}
