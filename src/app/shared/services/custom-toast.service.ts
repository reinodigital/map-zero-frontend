import { Injectable, signal } from '@angular/core';
import { IDataToast } from '../../interfaces';

@Injectable({
  providedIn: 'root',
})
export class CustomToastService {
  toasts = signal<IDataToast[]>([]);

  add(data: IDataToast) {
    this.toasts.set([...this.toasts(), data]);
    setTimeout(() => this.remove(0), data.duration);
  }

  remove(index: number) {
    this.toasts.set(this.toasts().filter((_, i) => i !== index));
  }
}
