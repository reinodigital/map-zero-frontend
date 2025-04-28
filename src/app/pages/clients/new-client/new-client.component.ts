import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'new-client',
  imports: [ReactiveFormsModule],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss',
})
export class NewClientComponent {}
