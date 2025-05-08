import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { QuoteService } from '../../../api';
import { ListQuotesService } from '../list-quotes.service';

import { ReadableDatePipe } from '../../../pipes/readable-date.pipe';
import { TrackingEntityComponent } from '../../../shared/components/tracking-entity/tracking-entity.component';

import { IQuote } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-quote',
  imports: [
    CommonModule,
    RouterLink,
    ReadableDatePipe,
    TrackingEntityComponent,
  ],
  templateUrl: './detail-quote.component.html',
  styleUrl: './detail-quote.component.scss',
  standalone: true,
})
export default class DetailQuoteComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private location = inject(Location);

  private quoteService = inject(QuoteService);
  public listQuotesService = inject(ListQuotesService);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public quoteId!: number;
  public quote = signal<IQuote | null>(null);

  constructor() {
    this.quoteId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchItem();
  }

  private fetchItem(): void {
    this.quoteService
      .fetchOne(this.quoteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.quote.set(resp);
        }
      });
  }

  /* redirects */
  comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-quotes');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
