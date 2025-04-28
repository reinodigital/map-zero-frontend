import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Prerender,
  },

  // EMPLOYEES
  {
    path: 'employees',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'new-employee',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'clients',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
