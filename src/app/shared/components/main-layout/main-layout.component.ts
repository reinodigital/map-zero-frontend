import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { CurrentUserComponent } from '../current-user/current-user.component';
import { CustomToastComponent } from '../custom-toast/custom-toast.component';
import { CustomMenuService } from '../../services/custom-menu.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CurrentUserComponent,
    CustomToastComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export default class MainLayoutComponent {
  public customMenuService = inject(CustomMenuService);
  public isMenuOpen = signal(true);

  openCloseMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
