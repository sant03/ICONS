import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AvatarConfig } from '../models/types';

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
  permissions: string[];
}

export interface RegisterRequest {
  tenant: string;
  username: string;
  email: string;
  password: string;
  fullName: string;
  docId?: string;
  dateOfBirth?: string;
  phone?: string;
  positionName?: string;
  roleId: number;
}

export interface PublicRoleResponse {
  id: number;
  name: string;
  description: string;
}

export interface ProfileResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  docId: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  landline: string | null;
  positionName: string | null;
  avatarUrl: string | null;
  avatarConfig?: AvatarConfig;
  roleName: string | null;
  status: string;
  createdAt: string;
  tenantName: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  docId?: string;
  dateOfBirth?: string;
  phone?: string;
  landline?: string;
  positionName?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.base}/login`, body);
  }

  register(body: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.base}/register`, body);
  }

  publicRoles(tenant: string) {
    return this.http.get<PublicRoleResponse[]>(`${this.base}/roles`, {
      params: { tenant },
    });
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

  getProfile() {
    return this.http.get<ProfileResponse>(`${this.base}/profile`);
  }

  updateProfile(body: UpdateProfileRequest) {
    return this.http.put<ProfileResponse>(`${this.base}/profile`, body);
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
