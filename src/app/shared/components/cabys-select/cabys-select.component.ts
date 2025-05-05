import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, of, switchMap } from 'rxjs';

import { CabysService } from '../../../api';
import { PaginationComponent } from '../pagination/pagination.component';

import { ICabysSuggestion } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cabys-select',
  standalone: true,
  imports: [ReactiveFormsModule, PaginationComponent],
  templateUrl: './cabys-select.component.html',
  styleUrl: './cabys-select.component.scss',
})
export class CabysSelectComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private readonly cabysService = inject(CabysService);

  // INPUT
  public cabysInput = input<string | null>(null);

  // OUTPUT
  public cabysChange = output<string | null>();

  // DATA
  public cabysSuggestions = signal<ICabysSuggestion[]>([]);
  public selectedCabys = signal<string | null>(null);

  // PAGINATION
  public limit: number = 12;
  public offset = signal<number>(0);
  public total = signal<number>(0);
  public isLoading = signal<boolean>(false);

  // FORM
  public inputSearch = signal<FormControl>(new FormControl('', []));
  public searchMessage = signal<string>('');

  ngOnInit(): void {
    this.onInputChange();
    this.selectedCabys.set(this.cabysInput());
  }

  findCabysSuggestions(term: string) {
    return this.cabysService.getCabysSuggestions(
      term,
      this.limit,
      this.offset()
    );
  }

  selectOneCabys(cabysCode: string | null): void {
    if (this.selectedCabys() === cabysCode) return;

    this.selectedCabys.set(cabysCode);
    this.cabysChange.emit(cabysCode);
  }

  // DETECT PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.offset.set(offset);

    this.cabysService
      .getCabysSuggestions(this.inputSearch().value, this.limit, this.offset())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.isValid) {
          this.cabysSuggestions.set(resp.suggestions);
          this.total.set(resp.count);
        }

        this.isLoading.set(false);
      });
  }

  onInputChange(): void {
    this.inputSearch()
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        switchMap((term: string) => {
          if (!term || term.length < 5) {
            this.cabysSuggestions.set([]);
            return of([]);
          }
          return this.findCabysSuggestions(term);
        })
      )
      .subscribe((resp: any) => {
        if (resp) {
          if (resp.isValid) {
            this.cabysSuggestions.set(resp.suggestions);
            this.total.set(resp.count);
          } else {
            this.cabysSuggestions.set([]);
            this.displaySearchMessage(
              Object.keys(resp).some((key) => key === 'isValid')
                ? 'Sin resultados para esa búsqueda'
                : 'Escribe al menos 5 caracteres para la búsqueda'
            );

            this.total.set(0);
          }
        } else {
          this.cabysSuggestions.set([]);
          this.total.set(0);
          this.displaySearchMessage('Error de conexión al servidor.');
        }

        this.isLoading.set(false);
        this.offset.set(0);
      });
  }

  private displaySearchMessage(msg: string): void {
    this.searchMessage.set(msg);
    setTimeout(() => {
      this.searchMessage.set('');
    }, 3000);
  }
}
