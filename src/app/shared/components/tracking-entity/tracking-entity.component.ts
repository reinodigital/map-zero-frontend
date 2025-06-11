import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SharedService } from '../../../api';
import { ReadableDateTimePipe } from '../../../pipes/readable-date-time.pipe';
import { ModalAddNoteComponent } from '../../modals/modal-add-note/modal-add-note.component';
import { formatDateToString } from '../../helpers';

import { IAddTrackingNote, IDataEntity, ITracking } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tracking-entity',
  standalone: true,
  imports: [ReadableDateTimePipe],
  templateUrl: './tracking-entity.component.html',
  styleUrl: './tracking-entity.component.scss',
})
export class TrackingEntityComponent {
  private dialogRef = inject(MatDialog);
  private sharedService = inject(SharedService);

  public tracking = input.required<ITracking[]>();
  public entity = input.required<IDataEntity>();

  public trackingList = linkedSignal(() => this.tracking());

  addNote(): void {
    // Mat Dialog solution
    let dialogRef = this.dialogRef.open(ModalAddNoteComponent, {
      width: '35rem',
      height: '24rem',
      autoFocus: false,
      data: null,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((note: string | null) => {
      if (note) {
        const dataNote: IAddTrackingNote = {
          createdAt: formatDateToString(new Date()),
          note,
          refEntity: this.entity().refEntity,
          refEntityId: this.entity().refEntityId,
        };

        this.sharedService.addTrackingNote(dataNote).subscribe((resp) => {
          if (resp && resp.id) {
            this.trackingList.set([resp, ...this.trackingList()]);
          }
        });
      }
    });
  }
}
