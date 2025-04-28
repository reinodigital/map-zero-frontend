import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomToastService } from '../../services/custom-toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'custom-toast',
  standalone: true,
  templateUrl: './custom-toast.component.html',
  styleUrl: './custom-toast.component.scss',
  host: {
    class: 'toast_fixed',
  },
})
export class CustomToastComponent {
  public toastService = inject(CustomToastService);

  removeToast(index: number) {
    this.toastService.remove(index);
  }
}
