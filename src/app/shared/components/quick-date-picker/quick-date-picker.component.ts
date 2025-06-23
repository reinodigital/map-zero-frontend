import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { formatDateForInput } from '../../helpers';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'quick-date-picker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quick-date-picker.component.html',
  styleUrl: './quick-date-picker.component.scss',
  host: {
    '(document:click)': 'onOutsideClick($event)',
  },
})
export class QuickDatePickerComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private elementRef = inject(ElementRef<HTMLUListElement>);

  public dateControl: FormControl = new FormControl(this.dateInSevenDay, []);
  public optionsAreOpen = signal<boolean>(false);

  public dateChanged = output<string>();

  get dateInSevenDay(): string {
    const now = new Date();
    const in7Days = new Date(new Date().setDate(now.getDate() + 7));
    return formatDateForInput(in7Days);
  }

  ngOnInit(): void {
    this.dateControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.dateChanged.emit(value);
      });
  }

  onOutsideClick(event: any): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.optionsAreOpen.set(false);
    }
  }

  setDate(value: number): void {
    const today = new Date();
    const targetDate: Date = new Date(today.setDate(today.getDate() + value));
    const formattedDate = formatDateForInput(targetDate);

    if (formattedDate) {
      this.dateControl.patchValue(formattedDate);
    }

    this.optionsAreOpen.set(false);
  }

  toggleOptions(): void {
    this.optionsAreOpen.set(!this.optionsAreOpen());
  }
}
