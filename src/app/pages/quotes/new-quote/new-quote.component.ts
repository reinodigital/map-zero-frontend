import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-quote',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-quote.component.html',
  styleUrl: './new-quote.component.scss',
})
export default class NewQuoteComponent {}
