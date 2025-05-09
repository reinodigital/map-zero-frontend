import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'submit-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.scss'],
  standalone: true,
})
export class SubmitButtonComponent {
  public isFormSubmitting = input.required<boolean>();
  public primaryText = input.required<string>();
  public secondaryText = input.required<string>();
  public attributeName = input<string | null>(null);
  public attributeClass = input<string | null>(null);
  public attributeType = input<string>('button'); // default type="button"

  // BUTTON CLICK OR SUBMIT
  public buttonAction = input<string | null>(null);
  public actionToApply = input<string | null>(null);
  public btnWasClicked = output<string>();

  onClick(): void {
    if (this.attributeType() === 'submit' || !this.buttonAction()) return;

    this.btnWasClicked.emit(this.buttonAction()!);
  }
}
