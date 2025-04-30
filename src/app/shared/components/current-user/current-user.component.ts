import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  linkedSignal,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../api';

import { IAuth } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'current-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './current-user.component.html',
  styleUrl: './current-user.component.scss',
  host: {
    '(mouseover)': 'onMouseOver($event)',
    '(mouseleave)': 'onMouseLeave($event)',
  },
})
export class CurrentUserComponent {
  private platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  public userInfoIsOpen = signal<boolean>(false);
  public blankUser: IAuth = {
    uid: 0,
    name: '_',
    email: '_',
    mobile: '_',
    roles: [],
    isActive: 0,
  };

  @ViewChild('userContainer') userContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('userIcon') userIcon!: ElementRef<HTMLDivElement>;

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  public currentUser = linkedSignal(
    () => this.authService._user() ?? this.blankUser
  );

  public logout(): void {
    if (!this.userInfoIsOpen()) return;

    this.authService.logout().subscribe((_) => this.userInfoIsOpen.set(false));
  }

  // ======== Hover Listener by host binding ==============
  onMouseOver(): void {
    if (
      this.isBrowser &&
      this.userIcon.nativeElement.matches(':hover') &&
      !this.userInfoIsOpen()
    ) {
      this.userInfoIsOpen.set(true);
    }
  }

  onMouseLeave(): void {
    if (this.isBrowser && this.userInfoIsOpen()) {
      // Use a small delay to allow the user to move the mouse onto the dropdown
      setTimeout(() => {
        if (!this.userContainer.nativeElement.matches(':hover')) {
          this.userInfoIsOpen.set(false);
        }
      }, 100); // Adjust the delay as needed
    }
  }
  // ======== END Hover Listener by host binding ==============
}
