import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { SellerGuard } from './guards/seller.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component'),
  },
  {
    path: 'profile',
    loadComponent: () => import('./auth/profile/profile.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },

  // EMPLOYEES
  {
    path: 'employees',
    loadComponent: () =>
      import('./pages/employees/list-employees/list-employees.component'),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'new-employee',
    loadComponent: () =>
      import('./pages/employees/new-employee/new-employee.component'),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'edit-employee/:id',
    loadComponent: () =>
      import('./pages/employees/edit-employee/edit-employee.component'),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'detail-employee/:id',
    loadComponent: () =>
      import('./pages/employees/detail-employee/detail-employee.component'),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  // EMPLOYEES

  // CLIENTS
  {
    path: 'list-clients',
    loadComponent: () =>
      import('./pages/clients/list-clients/list-clients.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'detail-client/:id',
    loadComponent: () =>
      import('./pages/clients/detail-client/detail-client.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  // END CLIENTS

  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component'),
  },
];
