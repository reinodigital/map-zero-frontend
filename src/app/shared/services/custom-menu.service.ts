import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface SubMenuItem {
  label: string;
  baseUrl: string;
  subroutes: string[];
  isActive?: boolean;
  isSubtitle?: boolean;
}

export interface MenuItem {
  label: string;
  icon: string;
  id: string; // colapseName
  isActive: boolean;
  submenu: SubMenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class CustomMenuService {
  private router = inject(Router);
  public openMenuIndex = signal<number | null>(null);
  public lastMenuItemActiveId = signal<string>('collapseAccounting');

  public menu = signal<MenuItem[]>([
    {
      label: 'Contabilidad',
      icon: 'fa-solid fa-calculator me-2',
      id: 'collapseAccounting',
      isActive: true,
      submenu: [
        {
          label: 'Tipos de cuentas',
          baseUrl: '/list-account-type',
          subroutes: ['list-account-type'],
        },
        {
          label: 'Cuentas',
          baseUrl: '/list-accounts',
          subroutes: ['list-accounts'],
        },
      ],
    },
    {
      label: 'Negocio',
      icon: 'fa-solid fa-toolbox me-2',
      id: 'collapseBusiness',
      isActive: false,
      submenu: [
        {
          label: 'Ventas',
          baseUrl: '',
          subroutes: [],
          isSubtitle: true,
        },
        {
          label: 'Facturas',
          baseUrl: '/list-items', // changeMe!
          subroutes: ['list-items'], // changeMe!
        },
        {
          label: 'Pagos online',
          baseUrl: '/list-items', // changeMe!
          subroutes: ['list-items'], // changeMe!
        },
        {
          label: 'Cotizaciones',
          baseUrl: '/list-quotes',
          subroutes: ['list-quotes', 'new-quote', 'edit-quote', 'detail-quote'],
        },
        {
          label: 'Vista de ventas',
          baseUrl: '/list-items', // changeMe!
          subroutes: ['list-items'], // changeMe!
        },
        {
          label: 'Compras',
          baseUrl: '',
          subroutes: [],
          isSubtitle: true,
        },
        {
          label: 'Órdenes de compra',
          baseUrl: '/list-items', // changeMe!
          subroutes: ['list-items'], // changeMe!
        },
        {
          label: 'Vista de compras',
          baseUrl: '/list-items', // changeMe!
          subroutes: ['list-items'], // changeMe!
        },
        {
          label: 'Productos/Servicios',
          baseUrl: '',
          subroutes: [],
          isSubtitle: true,
        },
        {
          label: 'Items',
          baseUrl: '/list-items',
          subroutes: ['list-items', 'new-item', 'edit-item', 'detail-item'],
        },
      ],
    },
    {
      label: 'Contacto',
      icon: 'fa-solid fa-address-book me-2',
      id: 'collapseContacts',
      isActive: false,
      submenu: [
        {
          label: 'Contactos',
          baseUrl: '/list-clients',
          subroutes: [
            'list-clients',
            'new-client',
            'edit-client',
            'detail-client',
          ],
        },
      ],
    },
    {
      label: 'Administración',
      icon: 'fas fa-user-tie me-2',
      id: 'collapseAdministration',
      isActive: false,
      submenu: [
        {
          label: 'Empleados',
          baseUrl: '/list-employees',
          subroutes: [
            'list-employees',
            'new-employee',
            'edit-employee',
            'detail-employee',
          ],
        },
      ],
    },
  ]);

  toggleMenuParent(id: string): void {
    const menuToUpdate = this.menu().map((menuItem) => {
      if (menuItem.id === id) {
        // This is the clicked menu item, toggle its active state
        return { ...menuItem, isActive: !menuItem.isActive };
      } else {
        // This is not the clicked menu item, ensure it's inactive
        return { ...menuItem, isActive: false };
      }
    });

    this.menu.set(menuToUpdate);

    // Find if any menu is active after the update
    const activeMenu = menuToUpdate.find((menu) => menu.isActive);

    if (activeMenu) {
      this.lastMenuItemActiveId.set(activeMenu.id);
    } else {
      // No menu is active
      this.lastMenuItemActiveId.set('');
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigateByUrl(`/${route}`);
  }
}
