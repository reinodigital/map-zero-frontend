import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-account',
  standalone: true,
  imports: [],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.scss',
})
export default class NewAccountComponent {}
