import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'modal-add-note',
  standalone: true,
  templateUrl: './modal-add-note.component.html',
  styleUrls: ['./modal-add-note.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ModalAddNoteComponent {
  public dialogRef = inject(MatDialogRef<ModalAddNoteComponent>);

  public note: FormControl = new FormControl('', [Validators.required]);

  closePopUp(e: string) {
    if (e === 'continue' && !this.note.value) return;

    this.dialogRef.close(e === 'continue' ? this.note.value : null); // this close dialog and emit the value was clicked
  }
}
