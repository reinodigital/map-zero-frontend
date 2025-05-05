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

import { ItemService } from '../../../api';
import { ListItemsService } from '../list-items.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { IItem } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-items',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PaginationComponent],
  templateUrl: './list-items.component.html',
  styleUrl: './list-items.component.scss',
})
export default class ListItemsComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private itemService = inject(ItemService);
  public listItemsService = inject(ListItemsService);

  // ITEMS
  public items = signal<IItem[]>([]);

  // PAGINATION
  public limit: number = 5;
  public offset = computed<number>(() =>
    this.listItemsService.lastOffsetItemsList()
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
    this.itemService
      .fetchAll(this.limit, this.offset(), this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.items.set(resp.items);
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
    this.listItemsService.lastOffsetItemsList.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllItems();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listItemsService.lastOffsetItemsList.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllItems();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listItemsService.lastOffsetItemsList.set(offset);

    this.fetchAllItems();
  }
}
