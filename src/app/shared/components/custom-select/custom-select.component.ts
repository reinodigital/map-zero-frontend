import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, switchMap } from 'rxjs';

import { ItemService } from '../../../api';

import { IItemSuggestion } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
})
export class CustomSelectComponent {
  private destroyRef = inject(DestroyRef);
  private itemService = inject(ItemService);

  // FORM CONTROL
  public inputValue = signal<FormControl>(new FormControl(''));

  // SUGGESTION
  public suggestions = signal<IItemSuggestion[]>([]);
  public selectedSuggestion = signal<string>('');
  public notResultsString = 'sin resultados encontrados';

  // CONTROL FLAG
  private _isSelectingSuggestion: boolean = false; // New flag to control search trigger

  // OUTPUT EMITTER for the selected item
  public itemSelected = output<IItemSuggestion>(); // New output

  ngOnInit(): void {
    this.onInputChange();
  }

  onInputChange(): void {
    this.inputValue()
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        filter(() => !this._isSelectingSuggestion), // Ignore value changes when selecting a suggestion
        switchMap((query: string) => {
          const trimmedQuery = query ? query.trim() : '';

          // Avoid unnecessary api call when input search is reset
          if (!trimmedQuery || trimmedQuery.length < 3) {
            this.suggestions.set([]);
            this.selectedSuggestion.set('');
            return []; // Empty observable to avoid unnecessary API call
          }

          // this.selectedSuggestion.set(trimmedQuery);
          return this.itemService.getSuggestions(trimmedQuery);
        })
      )
      .subscribe((suggestions: IItemSuggestion[]) => {
        if (
          suggestions.length === 1 &&
          suggestions[0].name === this.notResultsString
        ) {
          this.suggestions.set(suggestions);
          setTimeout(() => {
            this.suggestions.set([]);
          }, 2000);
        } else {
          this.suggestions.set(suggestions);
        }
      });
  }

  public selectSuggestion(suggestion: IItemSuggestion): void {
    if (!suggestion.id) {
      return;
    }

    // Set the flag to true BEFORE updating the input value
    this._isSelectingSuggestion = true;

    this.inputValue().setValue(suggestion.shortName, { emitEvent: false });

    this.suggestions.set([]);

    this.itemSelected.emit(suggestion);

    // This delay ensures that any immediate subsequent actions don't re-trigger accidentally
    setTimeout(() => {
      this._isSelectingSuggestion = false;
    }, 50); // A small delay is usually sufficient (e.g., 50ms)
  }
}
