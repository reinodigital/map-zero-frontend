import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'list-accounts',
  standalone: true,
  imports: [],
  templateUrl: './list-accounts.component.html',
  styleUrl: './list-accounts.component.scss',
})
export default class ListAccountsComponent {}
