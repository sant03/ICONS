import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  tenant: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserInfo;
}

export interface AuthUserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  tenantName: string;
  tenantSlug: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.base}/login`, body);
  }

  refresh(refreshToken: string) {
    return this.http.post<AuthResponse>(`${this.base}/refresh`, { refreshToken });
  }

  logout(refreshToken: string) {
    return this.http.post<void>(`${this.base}/logout`, { refreshToken });
  }

  logoutAll() {
    return this.http.post<void>(`${this.base}/logout-all`, {});
  }

  me() {
    return this.http.get<AuthUserInfo>(`${this.base}/me`);
  }

  requestPasswordReset(tenant: string, email: string) {
    return this.http.post<void>(`${this.base}/password-reset/request`, { tenant, email });
  }

  confirmPasswordReset(tenant: string, email: string, code: string, newPassword: string) {
    return this.http.post<void>(`${this.base}/password-reset/confirm`, {
      tenant, email, code, newPassword,
    });
  }
}
