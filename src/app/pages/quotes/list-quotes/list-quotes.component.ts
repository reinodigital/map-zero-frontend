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

import { ListQuotesService } from '../list-quotes.service';
import { QuoteService } from '../../../api';

import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ReadableDatePipe } from '../../../pipes/readable-date.pipe';

import { IQuote } from '../../../interfaces';
import { LimitValues } from '../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-quotes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PaginationComponent,
    RouterLink,
    ReadableDatePipe,
  ],
  templateUrl: './list-quotes.component.html',
  styleUrl: './list-quotes.component.scss',
})
export default class ListQuotesComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private quoteService = inject(QuoteService);
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

  // FILTERS
  public filtersOpen = signal<boolean>(false);
  public filters = signal<any>({});
  public isActiveFilters = signal<boolean>(false);
  public searchForm = signal<FormGroup>(
    this.fb.group({
      name: ['', []],
    })
  );

  ngOnInit(): void {
    this.fetchAllItems();
  }

  fetchAllItems(): void {
    this.quoteService
      .fetchAll(this.limit, this.offset(), this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.quotes.set(resp.quotes);
        }

        this.isLoading.set(false);
      });
  }

  // FILTERS
  openCloseFilters(): void {
    this.filtersOpen.set(!this.filtersOpen());
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
