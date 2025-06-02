import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'sales-overview',
  standalone: true,
  imports: [],
  templateUrl: './sales-overview.component.html',
  styleUrl: './sales-overview.component.scss',
})
export default class SalesOverviewComponent {}
