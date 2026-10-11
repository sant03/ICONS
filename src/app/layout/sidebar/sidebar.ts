import { Component, inject } from '@angular/core';
import {
  LucideChevronRight,
  LucideDynamicIcon,
  LucideFileText,
  LucideHandshake,
  LucideHome,
  LucideLayoutGrid,
  LucideLogOut,
  LucidePackage,
  LucideSettings,
  LucideShoppingBag,
  LucideSparkles,
  LucideTrendingUp,
  LucideUsers,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';
import { ViewMode } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

interface MenuItem {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [LucideDynamicIcon, LucideChevronRight, LucideSparkles, LucideLogOut, LucideX, LucideLayoutGrid],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly store = inject(AppStore);

  protected readonly menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: LucideHome },
    { id: 'users', label: 'Usuarios', icon: LucideUsers, badge: '1' },
    { id: 'sales', label: 'Ventas', icon: LucideTrendingUp },
    { id: 'orders', label: 'Pedidos / Ventas', icon: LucideShoppingBag, badge: '8' },
    { id: 'products', label: 'Productos', icon: LucidePackage },
    { id: 'purchase-orders', label: 'Orden de Compra', icon: LucideFileText, highlight: true },
    { id: 'clients', label: 'Clientes / Proveedores', icon: LucideHandshake },
    { id: 'settings', label: 'Ajustes', icon: LucideSettings },
  ];
}
