import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { SellerGuard } from './guards/seller.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./modules/business/dashboard/dashboard.component'),
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
    path: 'list-employees',
    loadComponent: () =>
      import(
        './modules/business/employees/list-employees/list-employees.component'
      ),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'new-employee',
    loadComponent: () =>
      import(
        './modules/business/employees/new-employee/new-employee.component'
      ),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'edit-employee/:id',
    loadComponent: () =>
      import(
        './modules/business/employees/edit-employee/edit-employee.component'
      ),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  {
    path: 'detail-employee/:id',
    loadComponent: () =>
      import(
        './modules/business/employees/detail-employee/detail-employee.component'
      ),
    canActivate: [AdminGuard],
    canLoad: [AdminGuard],
  },
  // EMPLOYEES

  // CLIENTS
  {
    path: 'list-clients',
    loadComponent: () =>
      import('./modules/business/clients/list-clients/list-clients.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'detail-client/:id',
    loadComponent: () =>
      import(
        './modules/business/clients/detail-client/detail-client.component'
      ),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'new-client',
    loadComponent: () =>
      import('./modules/business/clients/new-client/new-client.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'edit-client/:id',
    loadComponent: () =>
      import('./modules/business/clients/edit-client/edit-client.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  // END CLIENTS

  // ITEMS
  {
    path: 'list-items',
    loadComponent: () =>
      import('./modules/business/items/list-items/list-items.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'new-item',
    loadComponent: () =>
      import('./modules/business/items/new-item/new-item.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'detail-item/:id',
    loadComponent: () =>
      import('./modules/business/items/detail-item/detail-item.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'edit-item/:id',
    loadComponent: () =>
      import('./modules/business/items/edit-item/edit-item.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END ITEMS

  // QUOTES
  {
    path: 'list-quotes',
    loadComponent: () =>
      import('./modules/business/quotes/list-quotes/list-quotes.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'new-quote',
    loadComponent: () =>
      import('./modules/business/quotes/new-quote/new-quote.component'),
    canActivate: [SellerGuard],
    canLoad: [SellerGuard],
  },
  {
    path: 'detail-quote/:id',
    loadComponent: () =>
      import('./modules/business/quotes/detail-quote/detail-quote.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END QUOTES
];
