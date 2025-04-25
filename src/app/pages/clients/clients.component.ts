import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'clients',
  standalone: true,
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export default class ClientsComponent {}
