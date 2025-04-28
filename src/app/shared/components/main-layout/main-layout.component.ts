import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { CurrentUserComponent } from '../current-user/current-user.component';
import { CustomToastComponent } from '../custom-toast/custom-toast.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    CurrentUserComponent,
    CustomToastComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export default class MainLayoutComponent {
  public isMenuOpen = signal(true);

  openCloseMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
