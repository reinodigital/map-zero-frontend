import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../api';
import { IAuth } from '../../interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
})
export default class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // USER DATA
  public currentUser = signal<IAuth | null>(null);

  // PAYMENT DATA
  public maintenances = signal<any[]>([]);
  public totalMaintenances = signal<number>(0);

  // PILLS
  public arrPills: string[] = ['Mi perfil'];
  public currentPillSelected = signal<number>(0);
  public idPillArr: string[] = ['pills-profile-tab'];

  constructor() {
    // Get current User data
    this.currentUser.set(this.authService.userProps);
  }

  // CLICK over one specific pill
  clickOverPill(): void {
    if (this.isBrowser) {
      const idPill = this.idPillArr[this.currentPillSelected()];
      const btnPill: HTMLElement = document.querySelector(`#${idPill}`)!;
      btnPill.click();
    }
  }

  selectPill(i: number): void {
    if (i === this.currentPillSelected()) return;
    this.currentPillSelected.set(i);
    this.clickOverPill();
  }

  logout(): void {
    this.authService.logout().subscribe((resp) => {
      resp && resp.ok ? this.router.navigateByUrl('/login') : ''; // TODO: missing message toast
    });
  }
}
