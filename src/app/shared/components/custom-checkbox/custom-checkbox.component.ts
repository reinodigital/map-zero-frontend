import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  input,
  linkedSignal,
  output,
} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-checkbox',
  standalone: true,
  templateUrl: './custom-checkbox.component.html',
  styleUrl: './custom-checkbox.component.scss',
})
export class CustomCheckboxComponent {
  public negativeLabel = input.required<string>();
  public affirmativeLabel = input.required<string>();
  public checkboxDefaultValue = input<boolean>(false);
  public hostCheckboxDefaultClass = input<string>(
    'd-flex align-items-end justify-content-end cp w-100 me-2 mb-1'
  );

  public checkboxEmitter = output<boolean>();
  public checkboxValue = linkedSignal(() => this.checkboxDefaultValue());

  @HostBinding('class')
  get getHostClasses(): string {
    return this.hostCheckboxDefaultClass();
  }

  toggleCheckbox(event: boolean): void {
    this.checkboxValue.set(event);
    this.checkboxEmitter.emit(event);
  }
}
