import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ReadableDateTimePipe } from '../../../pipes/readable-date-time.pipe';
import { ITracking } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tracking-entity',
  standalone: true,
  imports: [ReadableDateTimePipe],
  templateUrl: './tracking-entity.component.html',
  styleUrl: './tracking-entity.component.scss',
})
export class TrackingEntityComponent {
  public tracking = input.required<ITracking[]>();
}
