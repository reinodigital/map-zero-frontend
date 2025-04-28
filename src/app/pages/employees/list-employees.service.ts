import { Injectable, signal } from '@angular/core';
import { SecurityRoles } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class ListEmployeesService {
  public lastOffsetEmployeesList = signal<number>(0);

  public getClassForUserRole(role: string): string {
    let roleClass = '';

    switch (role) {
      case SecurityRoles.ADMIN:
        roleClass = 'badge bg-label-primary';
        break;
      case SecurityRoles.SELLER:
        roleClass = 'badge bg-label-success';
        break;
      case SecurityRoles.ACCOUNTANT:
        roleClass = 'badge bg-label-light';
        break;
      case SecurityRoles.ADMINISTRATIVE_ASSISTANT:
        roleClass = 'badge bg-label-warning';
        break;
      case SecurityRoles.SUPER_ADMIN:
        roleClass = 'badge bg-label-danger';
        break;

      default:
        break;
    }

    return roleClass;
  }
}
