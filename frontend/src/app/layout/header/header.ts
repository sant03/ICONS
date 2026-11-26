import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideBell,
  LucideChevronDown,
  LucideLayoutGrid,
  LucideLogOut,
  LucideMoon,
  LucideSearch,
  LucideShieldCheck,
  LucideSun,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { AppStore } from '../../core/state/app-store';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    LucideLayoutGrid,
    LucideSearch,
    LucideShieldCheck,
    LucideSun,
    LucideMoon,
    LucideBell,
    LucideUser,
    LucideChevronDown,
    LucideLogOut,
    LucideX,
  ],
  templateUrl: './header.html',
})
export class Header {
  protected readonly store = inject(AppStore);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly userMenuOpen = signal(false);
  protected readonly userMenuAnimatingOut = signal(false);
  protected readonly mobileSearchOpen = signal(false);

  protected readonly currentModuleName = computed(() => {
    const view = this.store.currentView();
    const map: Record<string, string> = {
      dashboard: 'Inicio',
      users: 'Usuarios',
      profile: 'Perfil',
      sales: 'Ventas',
      orders: 'Pedidos',
      products: 'Productos',
      'purchase-orders': 'Orden de Compra',
      'purchase-order-detail': 'Orden de Compra',
      'purchase-order': 'Orden de Compra',
      clients: 'Clientes',
      suppliers: 'Proveedores',
      dispatches: 'Despachos',
      settings: 'Ajustes',
    };
    return map[view] ?? 'ICONS';
  });

  protected readonly avatarUrl = computed(() => this.auth.currentUser()?.avatarUrl ?? null);

  protected readonly initials = computed(() => {
    const name = this.auth.currentUser()?.fullName ?? '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase() || '??';
  });

  protected toggleMobileSearch(): void {
    this.mobileSearchOpen.update((open) => !open);
  }

  protected toggleUserMenu(): void {
    if (this.userMenuOpen()) {
      this.closeUserMenu();
    } else {
      this.userMenuAnimatingOut.set(false);
      this.userMenuOpen.set(true);
    }
  }

  protected closeUserMenu(): void {
    if (!this.userMenuOpen() || this.userMenuAnimatingOut()) return;
    this.userMenuAnimatingOut.set(true);
    setTimeout(() => {
      this.userMenuOpen.set(false);
      this.userMenuAnimatingOut.set(false);
    }, 180);
  }

  protected goToProfile(): void {
    this.closeUserMenu();
    void this.router.navigate(['/profile']);
  }

  protected logOut(): void {
    this.closeUserMenu();
    void this.auth.logout();
  }
}
