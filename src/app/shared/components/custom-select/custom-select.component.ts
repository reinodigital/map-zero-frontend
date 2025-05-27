import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  output,
  signal,
  forwardRef,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, of, switchMap, tap } from 'rxjs';

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
export class CustomSelectComponent implements ControlValueAccessor, OnInit {
  private destroyRef = inject(DestroyRef);
  private itemService = inject(ItemService);

  // FORM CONTROL
  public searchControl = new FormControl<string | number>('');

  // SUGGESTED ITEMS
  public items = signal<IItemSuggestion[]>([]);
  public selectedItem = signal<string>('');
  public notResultsString = 'sin resultados encontrados';

  // CONTROL FLAG
  private _isSelectingItem = signal<boolean>(false); // flag to control search trigger
  private _isInitialLoad = signal<boolean>(true); // flag for initial load editing

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
    if (value === null || value === undefined) {
      // Clear input for null/undefined
      this.searchControl.setValue('', { emitEvent: false });
      this._isInitialLoad.set(false); // No initial value to load
      return;
    }

    // When a value is set from the form
    this._isSelectingItem.set(true); // Temporarily stop search triggering

    if (typeof value === 'number') {
      // This is the case for editing: an itemId (number) is passed
      this.itemService
        .findOneAsSuggestion(value)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          // Ensure we don't trigger a new search on the input for this initial load
          tap(() => this._isSelectingItem.set(true))
        )
        .subscribe({
          next: (item: IItemSuggestion) => {
            if (item && item.id) {
              this.searchControl.setValue(item.shortName, { emitEvent: false });
              this.selectedItem.set(item.name); // Store the displayed name
              // Emit the item to the parent if it's the very first load and parent needs it
              if (this._isInitialLoad()) {
                item.isLoadingExistingItem = true;
                this.itemSelectedEmitter.emit(item);
                this.onChange(item.id); // Ensure the form control holds the ID
              }
            } else {
              // Item not found, clear the input
              this.searchControl.setValue('', { emitEvent: false });
              this.selectedItem.set('');
              this.onChange(null); // Clear parent form control
            }
          },
          error: (err: any) => {
            this.searchControl.setValue('', { emitEvent: false });
            this.selectedItem.set('');
            this.onChange(null); // Clear parent form control
          },
          complete: () => {
            // Reset initial load flag and allow search
            this._isInitialLoad.set(false);
            this._isSelectingItem.set(false);
          },
        });
    } else if (typeof value === 'string') {
      // This is for cases where the form might set a string (e.g., initial search query)
      this.searchControl.setValue(value, { emitEvent: false });
      this.selectedItem.set(value); // Store the displayed name
      this._isInitialLoad.set(false); // Not an initial ID load
      this._isSelectingItem.set(false);
    } else {
      // Fallback for unexpected types
      this.searchControl.setValue('', { emitEvent: false });
      this.selectedItem.set('');
      this._isInitialLoad.set(false);
      this._isSelectingItem.set(false);
    }
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
        // Important: Only process valueChanges if not in _isSelectingItem mode
        filter(
          (query) => typeof query === 'string' && !this._isSelectingItem()
        ),
        debounceTime(500),
        tap((value: any) => this.onTouched()),
        switchMap((query: string) => {
          // Query is now guaranteed to be a string
          const trimmedQuery = query ? query.trim() : '';

          if (!trimmedQuery || trimmedQuery.length < 3) {
            this.items.set([]);
            // When the input is cleared by the user, also clear the form control's value
            if (this.selectedItem() !== '') {
              // Only emit null if an item was previously selected/displayed
              this.onChange(null);
              this.itemSelectedEmitter.emit(null!); // Emit null to parent
            }
            this.selectedItem.set(''); // Clear selected item
            return of([]); // Return an empty observable
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

    this._isSelectingItem.set(true); // Block search temporarily
    this.searchControl.setValue(item.shortName, { emitEvent: false }); // Update visual input
    this.selectedItem.set(item.shortName); // Store the displayed name
    this.items.set([]); // Clear suggestions

    // Emit the actual ID to the parent form control (itemId)
    this.onChange(item.id);
    this.onTouched();

    this.itemSelectedEmitter.emit(item); // Emit full item for parent component to use

    setTimeout(() => {
      this._isSelectingItem.set(false); // Allow search again after a brief moment
    }, 50);
  }
}
