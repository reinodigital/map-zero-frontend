import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../api';
import { IAuth } from '../../../../interfaces';

@Component({
  selector: 'detail-employee',
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-employee.component.html',
  styleUrl: './detail-employee.component.scss',
})
export default class DetailEmployeeComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  private location = inject(Location);
  private authService = inject(AuthService);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA EMPLOYEE
  public employeeId!: number;
  public employee = signal<IAuth | null>(null);

  constructor() {
    this.employeeId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchEmployeeById();
  }

  private fetchEmployeeById(): void {
    this.authService.fetchOne(this.employeeId).subscribe((resp) => {
      if (resp && resp.uid) {
        this.employee.set(resp);
      }
    });
  }

  // --------- HELPERS ----------
  // Redirect to list, but if filters applies then keep them
  comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-employees');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
    // return true => There is a back URL
    // return false => There is no back URL or it's the initial navigation
  }
}
