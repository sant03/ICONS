import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApi, AuthUserInfo, RegisterRequest } from '../api/auth.api';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);

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
