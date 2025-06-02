import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-purchase-orders',
  standalone: true,
  imports: [],
  templateUrl: './list-purchase-orders.component.html',
  styleUrl: './list-purchase-orders.component.scss',
})
export default class ListPurchaseOrdersComponent {}
