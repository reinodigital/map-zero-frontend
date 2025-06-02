import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-invoices',
  standalone: true,
  imports: [],
  templateUrl: './list-invoices.component.html',
  styleUrl: './list-invoices.component.scss',
})
export default class ListInvoicesComponent {}
