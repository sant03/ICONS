import { Injectable, signal } from '@angular/core';

const ACCESS_KEY = 'icons_access_token';
const REFRESH_KEY = 'icons_refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly isAuthenticated = signal(!!this.getAccessToken());

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    this.isAuthenticated.set(true);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.isAuthenticated.set(false);
  }
}
