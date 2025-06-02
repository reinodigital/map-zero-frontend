import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-invoice',
  standalone: true,
  imports: [],
  templateUrl: './detail-invoice.component.html',
  styleUrl: './detail-invoice.component.scss',
})
export default class DetailInvoiceComponent {}
