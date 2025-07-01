import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { OverviewService } from '../../../../api/overview.service';

import { ISalesOverviewStats } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sales-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-overview.component.html',
  styleUrl: './sales-overview.component.scss',
})
export default class SalesOverviewComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private overviewService = inject(OverviewService);

  public sales = signal<ISalesOverviewStats | null>(null);
  public objectKeys = Object.keys;

  ngOnInit(): void {
    this.overviewService
      .fetchSalesOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp) {
          this.sales.set(resp);
        }
      });
  }
}
