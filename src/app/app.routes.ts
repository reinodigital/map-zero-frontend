import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component'),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component'),
  },
  {
    path: 'clients',
    loadComponent: () => import('./pages/clients/clients.component'),
  },
];
