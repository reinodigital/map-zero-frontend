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
    path: 'list-employees',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'new-employee',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'detail-employee/:id',
    renderMode: RenderMode.Client,
  },
  // END EMPLOYEES

  // CLIENTS
  {
    path: 'list-clients',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'detail-client/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'new-client',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'edit-client/:id',
    renderMode: RenderMode.Client,
  },
  // END CLIENTS

  // ITEMS
  {
    path: 'list-items',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'new-item',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'edit-item/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'detail-item/:id',
    renderMode: RenderMode.Client,
  },
  // END ITEMS

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
