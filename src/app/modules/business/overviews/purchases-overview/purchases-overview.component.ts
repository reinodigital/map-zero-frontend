import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OverviewService } from '../../../../api/overview.service';

import { IPurchasesOverviewStats } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'purchases-overview',
  imports: [CommonModule],
  templateUrl: './purchases-overview.component.html',
  styleUrl: './purchases-overview.component.scss',
})
export default class PurchasesOverviewComponent {
  private destroyRef = inject(DestroyRef);
  private overviewService = inject(OverviewService);

  public purchases = signal<IPurchasesOverviewStats | null>(null);
  public objectKeys = Object.keys;

  ngOnInit(): void {
    this.overviewService
      .fetchPurchasesOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp) {
          this.purchases.set(resp);
        }
      });
  }
}
