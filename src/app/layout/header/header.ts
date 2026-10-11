import { Component, inject, signal } from '@angular/core';
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
  private readonly router = inject(Router);

  protected readonly userMenuOpen = signal(false);
  protected readonly mobileSearchOpen = signal(false);

  protected toggleMobileSearch(): void {
    this.mobileSearchOpen.update((open) => !open);
  }

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  protected goToProfile(): void {
    this.userMenuOpen.set(false);
    void this.router.navigate(['/profile']);
  }

  protected logOut(): void {
    this.userMenuOpen.set(false);
    void this.router.navigate(['/welcome']);
  }
}
