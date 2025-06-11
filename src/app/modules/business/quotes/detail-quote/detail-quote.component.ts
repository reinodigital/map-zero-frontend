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

import { QuoteService } from '../../../../api';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { DetailQuoteService } from '../detail-quote.service';

import { ReadableDatePipe } from '../../../../pipes/readable-date.pipe';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { NameEntities, StatusQuote } from '../../../../enums';
import { IDataEntity, IQuote } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-quote',
  imports: [
    CommonModule,
    RouterLink,
    ReadableDatePipe,
    TrackingEntityComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './detail-quote.component.html',
  styleUrl: './detail-quote.component.scss',
  standalone: true,
})
export default class DetailQuoteComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);

  private quoteService = inject(QuoteService);
  public entityData = signal<IDataEntity | null>(null);
  public detailQuoteService = inject(DetailQuoteService);

  // STATUS GATEWAY
  public allowedStatusToBeEditedFromDraft = [StatusQuote.DRAFT as String];
  public allowedStatusToBeSent = [
    StatusQuote.DRAFT as String,
    StatusQuote.SENT as String,
  ];
  public allowedStatusToMarkAsSent = [StatusQuote.DRAFT as String];
  public allowedStatusToBeAccepted = [StatusQuote.SENT as String];
  public allowedStatusToBeInvoiced = [StatusQuote.ACCEPTED as String];
  public allowedStatusToBeDeclined = [StatusQuote.SENT as String];
  public allowedStatusToBeEdited = [
    StatusQuote.DRAFT as String,
    StatusQuote.SENT as String,
  ];

  public allowedStatusToUnMarkAsAccepted = [StatusQuote.ACCEPTED as String];
  public allowedStatusToUnMarkAsDeclined = [StatusQuote.DECLINED as String];
  public allowedStatusToUnMarkAsInvoiced = [StatusQuote.INVOICED as String];

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public quoteId!: number;
  public quote = signal<IQuote | null>(null);

  // DATA TOTALS
  public subtotal = signal<number>(0);
  public totalDiscount = signal<number>(0);
  public totalTax = signal<number>(0);
  public totalAmount = signal<number>(0);

  constructor() {
    this.quoteId = this.activatedRoute.snapshot.params['id'];
    this.entityData.set({
      refEntity: NameEntities.QUOTE,
      refEntityId: this.quoteId,
    });
  }

  ngOnInit(): void {
    this.fetchQuote();

    // LISTEN WHEN STATUS CHANGE
    this.detailQuoteService.statusChange$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fetchQuote();
      });
  }

  private fetchQuote(): void {
    this.quoteService
      .fetchOne(this.quoteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.quote.set(resp);
          this.updateTotals();
        }
      });
  }

  private updateTotals(): void {
    const totals = this.detailQuoteService.calculateTotalsOnDetail(
      this.quote()?.quoteItems ?? []
    );
    this.subtotal.set(totals.subtotal);
    this.totalDiscount.set(totals.discounts);
    this.totalTax.set(totals.iva);
    this.totalAmount.set(totals.total);
  }

  /* redirects */
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-quotes');
  }
}
