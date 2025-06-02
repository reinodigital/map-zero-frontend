import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-purchase-order',
  standalone: true,
  imports: [],
  templateUrl: './detail-purchase-order.component.html',
  styleUrl: './detail-purchase-order.component.scss',
})
export default class DetailPurchaseOrderComponent {}
