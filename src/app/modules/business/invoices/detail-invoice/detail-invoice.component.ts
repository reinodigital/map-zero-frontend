import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InvoiceService } from '../../../../api';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { DetailInvoiceService } from '../detail-invoice.service';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { NameEntities, StatusInvoice } from '../../../../enums';
import { IDataEntity, IInvoice } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-invoice',
  imports: [
    CommonModule,
    RouterLink,
    ReadableDatePipe,
    TrackingEntityComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './detail-invoice.component.html',
  styleUrl: './detail-invoice.component.scss',
  standalone: true,
})
export default class DetailInvoiceComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);

  private invoiceService = inject(InvoiceService);
  public detailInvoiceService = inject(DetailInvoiceService);
  public entityData = signal<IDataEntity | null>(null);

  // STATUS GATEWAY
  public allowedStatusToBeEditedFromButton = [StatusInvoice.DRAFT as String];
  public allowedStatusToBeSent = [
    StatusInvoice.DRAFT as String,
    StatusInvoice.SENT as String,
    StatusInvoice.AWAITING_APPROVAL as String,
    StatusInvoice.AWAITING_PAYMENT as String,
  ];
  public allowedStatusToMarkAsSent = [StatusInvoice.DRAFT as String];
  public allowedStatusToBeAwaitingApproval = [
    StatusInvoice.DRAFT as String,
    StatusInvoice.SENT as String,
  ];
  public allowedStatusToBeAwaitingPayment = [
    StatusInvoice.AWAITING_APPROVAL as String,
  ];
  public allowedStatusToBePaid = [StatusInvoice.AWAITING_PAYMENT as String];
  public allowedStatusToBeEdited = [
    StatusInvoice.DRAFT as String,
    StatusInvoice.SENT as String,
    StatusInvoice.AWAITING_APPROVAL as String,
  ];
  public allowedStatusToBeRemoved = [
    StatusInvoice.DRAFT as String,
    StatusInvoice.SENT as String,
  ];

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public invoiceId!: number;
  public invoice = signal<IInvoice | null>(null);

  // DATA TOTALS
  public subtotal = signal<number>(0);
  public totalDiscount = signal<number>(0);
  public totalTax = signal<number>(0);
  public totalAmount = signal<number>(0);

  constructor() {
    this.invoiceId = this.activatedRoute.snapshot.params['id'];
    this.entityData.set({
      refEntity: NameEntities.INVOICE,
      refEntityId: this.invoiceId,
    });
  }

  ngOnInit(): void {
    this.fetchInvoice();

    // LISTEN WHEN STATUS CHANGE
    this.detailInvoiceService.statusChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fetchInvoice();
      });
  }

  private fetchInvoice(): void {
    this.invoiceService
      .fetchOne(this.invoiceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.invoice.set(resp);
          this.updateTotals();
        }
      });
  }

  private updateTotals(): void {
    const totals = this.detailInvoiceService.calculateTotalsOnDetail(
      this.invoice()?.invoiceItems ?? []
    );
    this.subtotal.set(totals.subtotal);
    this.totalDiscount.set(totals.discounts);
    this.totalTax.set(totals.iva);
    this.totalAmount.set(totals.total);
  }

  /* redirects */
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-invoices');
  }
}
