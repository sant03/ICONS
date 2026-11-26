import { AfterViewInit, Component, effect, inject, signal } from '@angular/core';
import {
  LucideChevronLeft,
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
  LucideTruck,
  LucideUsers,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';
import { ViewMode } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { SwipeDismissDirective } from '../../shared/directives/swipe-dismiss.directive';

interface MenuItem {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    LucideDynamicIcon,
    LucideChevronRight,
    LucideChevronLeft,
    LucideSparkles,
    LucideLogOut,
    LucideX,
    LucideLayoutGrid,
    SwipeDismissDirective,
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar implements AfterViewInit {
  protected readonly store = inject(AppStore);
  protected readonly desktopReady = signal(false);
  protected readonly isVisibleOnMobile = signal(false);
  protected readonly isAnimatingOut = signal(false);
  protected readonly isAnimatingIn = signal(false);
  private animTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const open = this.store.sidebarOpen();
      if (open) {
        if (this.animTimeout) clearTimeout(this.animTimeout);
        this.isAnimatingOut.set(false);
        this.isAnimatingIn.set(true);
        this.isVisibleOnMobile.set(true);
        this.animTimeout = setTimeout(() => {
          this.isAnimatingIn.set(false);
        }, 420);
      } else if (this.isVisibleOnMobile()) {
        this.isAnimatingIn.set(false);
        this.isAnimatingOut.set(true);
        if (this.animTimeout) clearTimeout(this.animTimeout);
        this.animTimeout = setTimeout(() => {
          this.isVisibleOnMobile.set(false);
          this.isAnimatingOut.set(false);
        }, 280);
      }
    });
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.desktopReady.set(true);
    });
  }

  protected readonly menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: LucideHome },
    { id: 'users', label: 'Usuarios', icon: LucideUsers, badge: '1' },
    { id: 'sales', label: 'Ventas', icon: LucideTrendingUp },
    { id: 'orders', label: 'Pedidos / Ventas', icon: LucideShoppingBag, badge: '8' },
    { id: 'products', label: 'Productos', icon: LucidePackage },
    { id: 'purchase-orders', label: 'Orden de Compra', icon: LucideFileText, highlight: true },
    { id: 'clients', label: 'Clientes / Proveedores', icon: LucideHandshake },
    { id: 'dispatches', label: 'Despachos', icon: LucideTruck, highlight: true },
    { id: 'settings', label: 'Ajustes', icon: LucideSettings },
  ];
}
