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

import { AccountService } from '../../../api';
import { ListAccountsService } from '../list-accounts.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import { IAccount } from '../../../interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-accounts',
  standalone: true,
  imports: [ReactiveFormsModule, PaginationComponent, RouterLink],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.scss',
})
export default class ListAccountsComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  public listAccountsService = inject(ListAccountsService);

  // ACCOUNTS
  public accounts = signal<IAccount[]>([]);

  // PAGINATION
  public limit: number = 5;
  public offset = computed<number>(() =>
    this.listAccountsService.lastOffsetListAccounts()
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
    this.fetchAllAccounts();

    this.listAccountsService.newAccount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => this.fetchAllAccounts());
  }

  fetchAllAccounts(): void {
    this.accountService
      .fetchAll(this.limit, this.offset(), this.filters())
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.accounts.set(resp.accounts);
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
    this.listAccountsService.lastOffsetListAccounts.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllAccounts();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listAccountsService.lastOffsetListAccounts.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllAccounts();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listAccountsService.lastOffsetListAccounts.set(offset);

    this.fetchAllAccounts();
  }
}
