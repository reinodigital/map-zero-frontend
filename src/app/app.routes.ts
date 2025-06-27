import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AccountantGuard } from './guards/accountant.guard';
import { SellerGuard } from './guards/seller.guard';

import LoginComponent from './auth/login/login.component';

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
    component: LoginComponent,
  },
  {
    path: 'profile',
    loadComponent: () => import('./auth/profile/profile.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },

  // ACCOUNT
  {
    path: 'list-accounts',
    loadComponent: () =>
      import('./modules/accounting/list-accounts/list-accounts.component'),
    canActivate: [AccountantGuard],
    canLoad: [AccountantGuard],
  },
  {
    path: 'list-account-type',
    loadComponent: () =>
      import(
        './modules/accounting/list-account-type/list-account-type.component'
      ),
    canActivate: [AccountantGuard],
    canLoad: [AccountantGuard],
  },
  // END ACCOUNT

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
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'new-client',
    loadComponent: () =>
      import('./modules/business/clients/new-client/new-client.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'detail-client/:id',
    loadComponent: () =>
      import(
        './modules/business/clients/detail-client/detail-client.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'edit-client/:id',
    loadComponent: () =>
      import('./modules/business/clients/edit-client/edit-client.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
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

  // LIST OVERVIEW
  {
    path: 'purchases-overview',
    loadComponent: () =>
      import(
        './modules/business/overviews/purchases-overview/purchases-overview.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'sales-overview',
    loadComponent: () =>
      import(
        './modules/business/overviews/sales-overview/sales-overview.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END OVERVIEW

  // QUOTES
  {
    path: 'list-quotes',
    loadComponent: () =>
      import('./modules/business/quotes/list-quotes/list-quotes.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'new-quote',
    loadComponent: () =>
      import('./modules/business/quotes/new-quote/new-quote.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'detail-quote/:id',
    loadComponent: () =>
      import('./modules/business/quotes/detail-quote/detail-quote.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'edit-quote/:id',
    loadComponent: () =>
      import('./modules/business/quotes/edit-quote/edit-quote.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END QUOTES

  // INVOICES
  {
    path: 'list-invoices',
    loadComponent: () =>
      import(
        './modules/business/invoices/list-invoices/list-invoices.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'new-invoice',
    loadComponent: () =>
      import('./modules/business/invoices/new-invoice/new-invoice.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'detail-invoice/:id',
    loadComponent: () =>
      import(
        './modules/business/invoices/detail-invoice/detail-invoice.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'edit-invoice/:id',
    loadComponent: () =>
      import('./modules/business/invoices/edit-invoice/edit-invoice.component'),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END INVOICES

  // PURCHASE ORDERS
  {
    path: 'list-purchase-orders',
    loadComponent: () =>
      import(
        './modules/business/purchase-orders/list-purchase-order/list-purchase-orders.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'new-purchase-order',
    loadComponent: () =>
      import(
        './modules/business/purchase-orders/new-purchase-order/new-purchase-order.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'edit-purchase-order/:id',
    loadComponent: () =>
      import(
        './modules/business/purchase-orders/edit-purchase-order/edit-purchase-order.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  {
    path: 'detail-purchase-order/:id',
    loadComponent: () =>
      import(
        './modules/business/purchase-orders/detail-purchase-order/detail-purchase-order.component'
      ),
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
  },
  // END PURCHASE ORDERS
];
