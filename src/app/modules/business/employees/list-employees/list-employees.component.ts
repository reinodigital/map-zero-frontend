import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../api';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ListEmployeesService } from '../list-employees.service';

import { IAuth } from '../../../../interfaces';
import { SecurityRoles } from '../../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-employees',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, ReactiveFormsModule],
  templateUrl: './list-employees.component.html',
  styleUrl: './list-employees.component.scss',
})
export default class ListEmployeesComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public listEmployeesService = inject(ListEmployeesService);

  // USERS
  public users = signal<IAuth[]>([]);

  // PAGINATION
  public limit: number = 5;
  public offset = computed<number>(() =>
    this.listEmployeesService.lastOffsetEmployeesList()
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
      mobile: ['', []],
      email: ['', []],
      role: ['', []],
      status: ['', []],
      // initDate: ['', []],
      // endDate: ['', []],
    })
  );

  public allowedFilteredRoles: string[] = [
    SecurityRoles.ADMINISTRATIVE_ASSISTANT,
    SecurityRoles.ADMIN,
    SecurityRoles.SELLER,
    SecurityRoles.ACCOUNTANT,
  ];

  ngOnInit(): void {
    this.fetchAllUsers();
  }

  // FETCH ALL USERS CLIENTS
  fetchAllUsers(): void {
    this.authService
      .fetchAllByAdmin(this.limit, this.offset(), this.filters())
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.users.set(resp.users);
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
    this.listEmployeesService.lastOffsetEmployeesList.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllUsers();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listEmployeesService.lastOffsetEmployeesList.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllUsers();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listEmployeesService.lastOffsetEmployeesList.set(offset);

    this.fetchAllUsers();
  }
}
