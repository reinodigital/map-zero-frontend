import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

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
    path: 'products',
    loadComponent: () => import('./pages/products/products.component'),
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/clients.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
];
