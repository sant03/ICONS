import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { AuthApi, AuthUserInfo, RegisterRequest } from '../api/auth.api';
import { PushNotificationService } from '../push/push-notification.service';
import { ToastNotificationService } from '../services/toast-notification.service';
import { AppStore } from '../state/app-store';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);
  private readonly pushService = inject(PushNotificationService);
  private readonly toastService = inject(ToastNotificationService);
  private readonly appStore = inject(AppStore);

  readonly currentUser = signal<AuthUserInfo | null>(null);
  readonly loginError = signal<string | null>(null);
  readonly loading = signal(false);

  async login(tenant: string, username: string, password: string): Promise<boolean> {
    this.loginError.set(null);
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.login({ tenant, username, password }));
      this.tokens.setTokens(res.accessToken, res.refreshToken);
      this.currentUser.set(res.user);
      this.pushService.subscribeToPush();
      this.appStore.loadNotifications();
      return true;
    } catch (err: any) {
      const msg = err?.error?.detail ?? 'Error de conexión con el servidor';
      this.loginError.set(msg);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async register(request: RegisterRequest): Promise<boolean> {
    this.loginError.set(null);
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.register(request));
      this.tokens.setTokens(res.accessToken, res.refreshToken);
      this.currentUser.set(res.user);
      this.pushService.subscribeToPush();
      this.appStore.loadNotifications();
      this.router.events.pipe(
        filter((e) => e instanceof NavigationEnd),
        take(1),
      ).subscribe(() => {
        setTimeout(() => {
          this.toastService.show({
            title: '¡Bienvenido a ICONS!',
            body: 'Personaliza tu perfil subiendo una foto. Ve a tu perfil para comenzar.',
            type: 'welcome',
            url: '/profile',
          });
        }, 400);
      });
      return true;
    } catch (err: any) {
      const msg = err?.error?.detail ?? 'Error al crear la cuenta';
      this.loginError.set(msg);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.pushService.unsubscribeFromPush();
    const refreshToken = this.tokens.getRefreshToken();
    if (refreshToken) {
      try {
        await firstValueFrom(this.api.logout(refreshToken));
      } catch {
        // silent — token might already be expired
      }
    }
    this.tokens.clear();
    this.currentUser.set(null);
    await this.router.navigate(['/login']);
  }

  async loadCurrentUser(): Promise<AuthUserInfo | null> {
    if (!this.tokens.isAuthenticated()) return null;
    try {
      const user = await firstValueFrom(this.api.me());
      this.currentUser.set(user);
      return user;
    } catch {
      this.tokens.clear();
      this.currentUser.set(null);
      return null;
    }
  }
}
