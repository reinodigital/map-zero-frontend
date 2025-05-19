import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountTypeService } from '../../../api';
import { ListAccountsService } from '../list-accounts.service';

import { IAccountType } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-account-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-account-type.component.html',
  styleUrl: './list-account-type.component.scss',
})
export default class ListAccountTypeComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private accountTypeService = inject(AccountTypeService);
  public listAccountsService = inject(ListAccountsService);

  public accountTypes = signal<IAccountType[]>([]);

  // PAGINATION
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
    this.fetchAllAccountType();

    this.listAccountsService.newAccountType$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((_) => this.fetchAllAccountType());
  }

  fetchAllAccountType(): void {
    this.accountTypeService.fetchAll().subscribe((resp) => {
      if (resp && resp.length) {
        this.total.set(resp.length);
        this.accountTypes.set(resp);
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

    this.isActiveFilters.set(true);
    this.fetchAllAccountType();
  }

  restartFilters(): void {
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllAccountType();
  }
}
