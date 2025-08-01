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

import { PurchaseOrderService } from '../../../../api';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { DetailPurchaseOrderService } from '../detail-purchase-order.service';
import { DetailCopyPurchaseOrderToService } from '../detail-copy-purchase-order-to.service';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { NameEntities, StatusPurchaseOrder } from '../../../../enums';
import { IDataEntity, IPurchaseOrder } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-purchase-order',
  imports: [
    CommonModule,
    RouterLink,
    ReadableDatePipe,
    TrackingEntityComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './detail-purchase-order.component.html',
  styleUrl: './detail-purchase-order.component.scss',
  standalone: true,
})
export default class DetailPurchaseOrderComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);

  private purchaseOrderService = inject(PurchaseOrderService);
  public entityData = signal<IDataEntity | null>(null);
  public detailPurchaseOrderService = inject(DetailPurchaseOrderService);
  public detailCopyPurchaseOrderToService = inject(
    DetailCopyPurchaseOrderToService
  );

  // STATUS GATEWAY
  public allowedStatusToBeEditedFromDraft = [
    StatusPurchaseOrder.DRAFT as String,
  ];
  public allowedStatusToBeSent = [
    StatusPurchaseOrder.DRAFT as String,
    StatusPurchaseOrder.SENT as String,
    StatusPurchaseOrder.AWAITING_APPROVAL as String,
    StatusPurchaseOrder.APPROVED as String,
  ];
  public allowedStatusToMarkAsSent = [StatusPurchaseOrder.DRAFT as String];
  public allowedStatusToBeAwaitingApproval = [
    StatusPurchaseOrder.DRAFT as String,
    StatusPurchaseOrder.SENT as String,
  ];
  public allowedStatusToBeApproved = [
    StatusPurchaseOrder.DRAFT as String,
    StatusPurchaseOrder.SENT as String,
    StatusPurchaseOrder.AWAITING_APPROVAL as String,
  ];
  public allowedStatusToBeBilled = [StatusPurchaseOrder.APPROVED as String];
  public allowedStatusToBeEdited = [
    StatusPurchaseOrder.DRAFT as String,
    StatusPurchaseOrder.SENT as String,
    StatusPurchaseOrder.AWAITING_APPROVAL as String,
    StatusPurchaseOrder.APPROVED as String,
    StatusPurchaseOrder.BILLED as String,
  ];

  public allowedStatusToUnMarkAsSent = [StatusPurchaseOrder.SENT as String];
  public allowedStatusToUnMarkAsApproved = [
    StatusPurchaseOrder.APPROVED as String,
  ];
  public allowedStatusToUnMarkAsAwaitingApproval = [
    StatusPurchaseOrder.AWAITING_APPROVAL as String,
  ];
  public allowedStatusToUnMarkAsBilled = [StatusPurchaseOrder.BILLED as String];

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public purchaseOrderId!: number;
  public purchaseOrder = signal<IPurchaseOrder | null>(null);

  // DATA TOTALS
  public subtotal = signal<number>(0);
  public totalDiscount = signal<number>(0);
  public totalTax = signal<number>(0);
  public totalAmount = signal<number>(0);

  constructor() {
    this.purchaseOrderId = this.activatedRoute.snapshot.params['id'];
    this.entityData.set({
      refEntity: NameEntities.PURCHASE_ORDER,
      refEntityId: this.purchaseOrderId,
    });
  }

  ngOnInit(): void {
    this.fetchPurchaseOrder();

    // LISTEN WHEN STATUS CHANGE
    this.detailPurchaseOrderService.statusPurchaseOrderChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fetchPurchaseOrder();
      });

    // LISTEN WHEN CURRENT PURCHASE-ORDER HAS BEEN COPIED
    this.listenWhenCurrentPurchaseOrderHasBeenCopied();
  }

  listenWhenCurrentPurchaseOrderHasBeenCopied(): void {
    this.detailCopyPurchaseOrderToService.currentPurchaseOrderCopied$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((purchaseOrderId: number) => {
        if (purchaseOrderId) {
          this.purchaseOrderId = purchaseOrderId;
          this.fetchPurchaseOrder();
        }
      });
  }

  downloadPDF(): void {
    this.purchaseOrderService
      .downloadPDF(this.purchaseOrderId)
      .subscribe((pdfBlob: Blob) => {
        if (pdfBlob) {
          // Create a Blob URL for the PDF
          const blobUrl = URL.createObjectURL(pdfBlob);

          // Create a temporary anchor element to trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `Orden-de-compra-${this.purchaseOrderId}.pdf`; // Set filename
          link.click();

          // Clean up the Blob URL after download
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            link.remove();
          }, 100);
        }
      });
  }

  private fetchPurchaseOrder(): void {
    this.purchaseOrderService
      .fetchOne(this.purchaseOrderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.purchaseOrder.set(resp);
          this.updateTotals();
        }
      });
  }

  private updateTotals(): void {
    const totals = this.detailPurchaseOrderService.calculateTotalsOnDetail(
      this.purchaseOrder()?.purchaseOrderItems ?? []
    );
    this.subtotal.set(totals.subtotal);
    this.totalDiscount.set(totals.discounts);
    this.totalTax.set(totals.iva);
    this.totalAmount.set(totals.total);
  }

  /* redirects */
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-purchase-orders');
  }
}
