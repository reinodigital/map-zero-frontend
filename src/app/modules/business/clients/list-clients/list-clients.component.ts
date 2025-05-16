import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClientService } from '../../../../api';
import { ListClientsService } from '../list-clients.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

import { IClient } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'list-clients',
  imports: [ReactiveFormsModule, RouterLink, PaginationComponent],
  templateUrl: './list-clients.component.html',
  styleUrl: './list-clients.component.scss',
})
export default class ListClientsComponent {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  public listClientsService = inject(ListClientsService);

  // CLIENTS
  public clients = signal<IClient[]>([]);

  // PAGINATION
  public limit: number = 5;
  public offset = computed<number>(() =>
    this.listClientsService.lastOffsetListClients()
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
      identity: ['', []],
      email: ['', []],
      mobile: ['', []],
      // initDate: ['', []],
      // endDate: ['', []],
    })
  );

  ngOnInit(): void {
    this.fetchAllClients();
  }

  fetchAllClients(): void {
    this.clientService
      .fetchAll(this.limit, this.offset(), this.filters())
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.clients.set(resp.clients);
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
    this.listClientsService.lastOffsetListClients.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllClients();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listClientsService.lastOffsetListClients.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllClients();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listClientsService.lastOffsetListClients.set(offset);

    this.fetchAllClients();
  }
}
