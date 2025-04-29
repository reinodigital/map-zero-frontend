import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
  signal,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss'],
  standalone: true,
})
export class ModalConfirmComponent {
  public dialogRef = inject(MatDialogRef<ModalConfirmComponent>);

  public data = signal<string>('');

  constructor(@Inject(MAT_DIALOG_DATA) public message: string) {
    this.data.set(message);
  }

  closePopUp(e: string) {
    this.dialogRef.close(e === 'continue'); // this close dialog and emit the value was clicked
  }
}
