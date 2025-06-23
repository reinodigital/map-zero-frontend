import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../api';

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
  private authService = inject(AuthService);
  public openMenuIndex = signal<number | null>(null);
  public lastMenuItemActiveId = signal<string>('collapseAccounting');

  public fullMenu = signal<MenuItem[]>([
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
          baseUrl: '/list-invoices',
          subroutes: ['list-invoices', 'edit-invoice', 'detail-invoice'],
        },
        {
          label: 'Cotizaciones',
          baseUrl: '/list-quotes',
          subroutes: ['list-quotes', 'new-quote', 'edit-quote', 'detail-quote'],
        },
        {
          label: 'Vista preliminar ventas',
          baseUrl: '/sales-overview',
          subroutes: ['sales-overview'],
        },
        {
          label: 'Compras',
          baseUrl: '',
          subroutes: [],
          isSubtitle: true,
        },
        {
          label: 'Órdenes de compra',
          baseUrl: '/list-purchase-orders',
          subroutes: ['list-purchase-orders', 'detail-purchase-order'],
        },
        {
          label: 'Vista preliminar compras',
          baseUrl: '/purchases-overview',
          subroutes: ['purchases-overview'],
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

  public menu = computed(() => {
    const isAuthenticated = this.authService.userProps;
    const isAdmin = this.authService.isAdmin; // Access computed signal for reactivity
    const isAccountant = this.authService.isAccountant; // Access computed signal for reactivity

    return this.fullMenu().filter((menuItem) => {
      if (!isAuthenticated) return false;

      if (menuItem.id === 'collapseAdministration') {
        return isAdmin;
      }
      if (menuItem.id === 'collapseAccounting') {
        return isAdmin || isAccountant;
      }

      return true;
    });
  });

  toggleMenuParent(id: string): void {
    const menuToUpdate = this.fullMenu().map((menuItem) => {
      if (menuItem.id === id) {
        // This is the clicked menu item, toggle its active state
        return { ...menuItem, isActive: !menuItem.isActive };
      } else {
        // This is not the clicked menu item, ensure it's inactive
        return { ...menuItem, isActive: false };
      }
    });

    this.fullMenu.set(menuToUpdate);

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
