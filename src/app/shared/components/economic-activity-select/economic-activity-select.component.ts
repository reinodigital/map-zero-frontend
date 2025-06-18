import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, Observable, of, switchMap } from 'rxjs';

import { EconomicActivityService } from '../../../api';
import { PaginationComponent } from '../pagination/pagination.component';

import {
  IActivitiesSuggestionResponse,
  IActivitySuggestion,
  ISelectedActivity,
} from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'economic-activity-select',
  standalone: true,
  imports: [ReactiveFormsModule, PaginationComponent],
  templateUrl: './economic-activity-select.component.html',
  styleUrl: './economic-activity-select.component.scss',
})
export class EconomicActivitySelectComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private economicActivityService = inject(EconomicActivityService);

  // INPUT
  public activityInput = input<ISelectedActivity[]>([]);

  // OUTPUT
  public activityChange = output<ISelectedActivity[]>();

  // DATA
  public activitiesSuggestions = signal<IActivitySuggestion[]>([]);
  public arraySelectedActivities = linkedSignal(() => this.activityInput());

  // PAGINATION
  public limit: number = 12;
  public offset = signal<number>(0);
  public total = signal<number>(0);
  public isLoading = signal<boolean>(false);

  // FORM
  public inputSearch = signal<FormControl>(new FormControl('', []));
  public searchMessage = signal<string>('');

  ngOnInit(): void {
    this.activateListenerInputChange();
  }

  findActivitiesSuggestions(
    term: string
  ): Observable<IActivitiesSuggestionResponse> {
    return this.economicActivityService.getActivitiesSuggestions(
      term,
      this.limit,
      this.offset()
    );
  }

  selectOneActivity(activity: IActivitySuggestion | null): void {
    if (!activity?.code) return;

    const activityClicked: ISelectedActivity = {
      code: activity.code,
      name: activity.name!,
    };

    if (this.activityMatch(activity)) {
      this.arraySelectedActivities.update((currentActivities) =>
        currentActivities.filter(
          (selectedActivity) => selectedActivity.code !== activityClicked.code
        )
      );
    } else {
      this.arraySelectedActivities.update((currentActivities) => [
        ...currentActivities,
        activityClicked,
      ]);
    }

    this.activityChange.emit(this.arraySelectedActivities());
  }

  activityMatch(activity: IActivitySuggestion): boolean {
    return this.arraySelectedActivities().some(
      (selectedActivity) => selectedActivity.code === activity.code
    );
  }

  // DETECT CHANGE ON PAGE
  detectChangeOffset(offset: number) {
    this.isLoading.set(true);
    this.offset.set(offset);

    this.economicActivityService
      .getActivitiesSuggestions(
        this.inputSearch().value,
        this.limit,
        this.offset()
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.isValid) {
          this.activitiesSuggestions.set(resp.suggestions);
          this.total.set(resp.count);
        }

        this.isLoading.set(false);
      });
  }

  activateListenerInputChange(): void {
    this.inputSearch()
      .valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500),
        switchMap((term: string) => {
          if (!term || term.length < 5) {
            this.activitiesSuggestions.set([]);
            return of([]);
          }

          return this.findActivitiesSuggestions(term);
        })
      )
      .subscribe((resp: any) => {
        if (resp) {
          if (resp.isValid) {
            this.activitiesSuggestions.set(resp.suggestions);
            this.total.set(resp.count);
          } else {
            this.activitiesSuggestions.set([]);
            this.displaySearchMessage(
              Object.keys(resp).some((key) => key === 'isValid')
                ? 'Sin resultados para esa búsqueda'
                : 'Escribe al menos 5 caracteres para la búsqueda'
            );

            this.total.set(0);
          }
        } else {
          this.activitiesSuggestions.set([]);
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
