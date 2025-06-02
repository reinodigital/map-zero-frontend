import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'purchases-overview',
  imports: [],
  templateUrl: './purchases-overview.component.html',
  styleUrl: './purchases-overview.component.scss',
})
export default class PurchasesOverviewComponent {}
