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

import { DetailPurchaseOrderService } from '../detail-purchase-order.service';
import { ListPurchaseOrdersService } from '../list-purchase-order.service';
import { PurchaseOrderService } from '../../../../api';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { LimitValues, StatusPurchaseOrder } from '../../../../enums';
import { IPurchaseOrder } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-purchase-orders',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    PaginationComponent,
    RouterLink,
    ReadableDatePipe,
    BreadcrumbComponent,
  ],
  templateUrl: './list-purchase-orders.component.html',
  styleUrl: './list-purchase-orders.component.scss',
})
export default class ListPurchaseOrdersComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private purchaseOrderService = inject(PurchaseOrderService);
  public detailPurchaseOrderService = inject(DetailPurchaseOrderService);
  public listPurchaseOrdersService = inject(ListPurchaseOrdersService);

  // PURCHASE-ORDERS
  public purchaseOrders = signal<IPurchaseOrder[]>([]);

  // PAGINATION
  public limit: number = LimitValues.TEN;
  public offset = computed<number>(() =>
    this.listPurchaseOrdersService.lastOffsetPurchaseOrdersList()
  );
  public total = signal<number>(0);
  public isLoading = signal<boolean>(true);

  // TOTALS STATUS
  public totalAll = signal<number>(0);
  public totalDraft = signal<number>(0);
  public totalSent = signal<number>(0);
  public totalAwaitingApproval = signal<number>(0);
  public totalApproved = signal<number>(0);
  public totalBilled = signal<number>(0);

  // FILTERS
  public purchaseOrderStatusFilter = signal<string>('');
  public filtersOpen = signal<boolean>(false);
  public filters = signal<any>({});
  public isActiveFilters = signal<boolean>(false);
  public searchForm = signal<FormGroup>(
    this.fb.group({
      purchaseOrderNumber: ['', []],
    })
  );

  ngOnInit(): void {
    this.fetchAllItems();
  }

  fetchAllItems(): void {
    this.filters.set({
      ...this.filters(),
      status: this.purchaseOrderStatusFilter(),
    });

    this.purchaseOrderService
      .fetchAll(this.limit, this.offset(), this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.count >= 0) {
          this.total.set(resp.count);
          this.purchaseOrders.set(resp.purchaseOrders);

          // status
          this.totalAll.set(resp.total);
          this.fillOutStatusPurchaseOrder(resp.statusCounts ?? null);
        }

        this.isLoading.set(false);
      });
  }

  // FILL OUT STATUS
  fillOutStatusPurchaseOrder(
    statusCounts: Record<string, number> | null
  ): void {
    if (!statusCounts) return;

    this.totalDraft.set(statusCounts[StatusPurchaseOrder.DRAFT] ?? 0);
    this.totalSent.set(statusCounts[StatusPurchaseOrder.SENT] ?? 0);
    this.totalAwaitingApproval.set(
      statusCounts[StatusPurchaseOrder.AWAITING_APPROVAL] ?? 0
    );
    this.totalApproved.set(statusCounts[StatusPurchaseOrder.APPROVED] ?? 0);
    this.totalBilled.set(statusCounts[StatusPurchaseOrder.BILLED] ?? 0);
  }

  // FILTERS
  openCloseFilters(): void {
    this.filtersOpen.set(!this.filtersOpen());
  }

  onTabChange(event: MatTabChangeEvent): void {
    const statusByIndex = [
      '',
      StatusPurchaseOrder.DRAFT,
      StatusPurchaseOrder.SENT,
      StatusPurchaseOrder.AWAITING_APPROVAL,
      StatusPurchaseOrder.APPROVED,
      StatusPurchaseOrder.BILLED,
    ];
    this.purchaseOrderStatusFilter.set(statusByIndex[event.index]);

    this.fetchAllItems();
  }

  searchFormSubmit(): void {
    this.filters.set(this.searchForm().value);

    // Set offset to 0 to allow pagination by filters
    this.listPurchaseOrdersService.lastOffsetPurchaseOrdersList.set(0);
    this.isActiveFilters.set(true);
    this.fetchAllItems();
  }

  restartFilters(): void {
    // Set offset to 0 to allow pagination by filters
    this.listPurchaseOrdersService.lastOffsetPurchaseOrdersList.set(0);
    this.isActiveFilters.set(false);
    this.filters.set({});
    this.searchForm().reset();
    this.fetchAllItems();
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.listPurchaseOrdersService.lastOffsetPurchaseOrdersList.set(offset);

    this.fetchAllItems();
  }
}
