import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, switchMap, tap } from 'rxjs';

import { ItemService } from '../../../api';

import { IItemSuggestion } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  // Provide the ControlValueAccessor
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor {
  private destroyRef = inject(DestroyRef);
  private itemService = inject(ItemService);

  // FORM CONTROL
  public searchControl = new FormControl<string>('');

  // SUGGESTED ITEMS
  public items = signal<IItemSuggestion[]>([]);
  public selectedItem = signal<string>('');
  public notResultsString = 'sin resultados encontrados';

  // CONTROL FLAG
  private _isSelectingItem = signal<boolean>(false); // New flag to control search trigger

  // OUTPUT
  public itemSelectedEmitter = output<IItemSuggestion>();

  // CVA related properties
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  public isDisabled: boolean = false;

  ngOnInit(): void {
    this.setupSearchControlListener();
  }

  // --- ControlValueAccessor methods ---
  writeValue(value: any): void {
    if (typeof value === 'string') {
      this.searchControl.setValue(value, { emitEvent: false });
    } else if (typeof value === 'number') {
      this.searchControl.setValue('', { emitEvent: false }); // Clear input if ID is set initially
    } else {
      this.searchControl.setValue('', { emitEvent: false }); // Clear input for null/undefined
    }

    // When the form wants to set the value, we don't want it to trigger a search
    this._isSelectingItem.set(true);
    setTimeout(() => this._isSelectingItem.set(false), 50);
  }

  // Registers a callback function that is called when the control's value changes in the UI.
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registers a callback function that is called when the control receives a touch event.
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Sets the disabled state for the control.
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
  // --- End ControlValueAccessor methods ---

  setupSearchControlListener(): void {
    this.searchControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        filter(() => !this._isSelectingItem()), // Ignore when selecting
        tap(() => this.onTouched()), // Mark touched when user types
        switchMap((query: string | null) => {
          const trimmedQuery = query ? query.trim() : '';

          if (!trimmedQuery || trimmedQuery.length < 3) {
            this.items.set([]);
            // When the input is cleared by the user, we should also clear the form control's value
            this.onChange(null); // Emit null or empty string to parent form control
            return [];
          }

          return this.itemService.getSuggestions(trimmedQuery);
        })
      )
      .subscribe((items: IItemSuggestion[]) => {
        if (items.length === 1 && items[0].name === this.notResultsString) {
          this.items.set(items);
          setTimeout(() => {
            this.items.set([]);
          }, 2000);
        } else {
          this.items.set(items);
        }
      });
  }

  public selectItem(item: IItemSuggestion): void {
    if (!item.id) {
      return;
    }

    this._isSelectingItem.set(true);
    this.searchControl.setValue(item.shortName, { emitEvent: false }); // Update visual input
    this.items.set([]);

    // Emit the actual ID to the parent form control (itemId)
    this.onChange(item.id); // This is how you update the parent FormArray's itemId!
    this.onTouched(); // Mark the control as touched

    this.itemSelectedEmitter.emit(item);

    setTimeout(() => {
      this._isSelectingItem.set(false);
    }, 50); // Small delay to prevent re-triggering search immediately
  }
}
