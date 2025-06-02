import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../api';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { ListEmployeesService } from '../list-employees.service';
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
  private commonAdminService = inject(CommonAdminService);
  private authService = inject(AuthService);
  public listEmployeesService = inject(ListEmployeesService);

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
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-employees');
  }
}
