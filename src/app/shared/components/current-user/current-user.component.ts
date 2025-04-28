import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../api';

import { IAuth } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'current-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-user.component.html',
  styleUrl: './current-user.component.scss',
})
export class CurrentUserComponent {
  private readonly authService = inject(AuthService);
  public blankUser: IAuth = {
    uid: 0,
    name: '--',
    mobile: '',
    roles: [],
    isActive: 0,
  };

  public currentUser = linkedSignal(
    () => this.authService._user() ?? this.blankUser
  );
}
