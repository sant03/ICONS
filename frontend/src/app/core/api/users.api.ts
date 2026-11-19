import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  docId: string;
  dateOfBirth: string;
  phone: string;
  landline: string;
  positionName: string;
  avatarUrl: string | null;
  roleName: string;
  status: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  docId?: string;
  dateOfBirth?: string;
  phone?: string;
  landline?: string;
  positionName?: string;
  roleId: number;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  docId?: string;
  dateOfBirth?: string;
  phone?: string;
  landline?: string;
  positionName?: string;
  avatarUrl?: string;
  roleId?: number;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  list(params?: { search?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<UserResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<UserResponse>(`${this.base}/${id}`);
  }

  create(body: CreateUserRequest) {
    return this.http.post<UserResponse>(this.base, body);
  }

  update(id: number, body: UpdateUserRequest) {
    return this.http.put<UserResponse>(`${this.base}/${id}`, body);
  }

  changePassword(id: number, currentPassword: string, newPassword: string) {
    return this.http.post<void>(`${this.base}/${id}/change-password`, {
      currentPassword, newPassword,
    });
  }

  resetPassword(id: number) {
    return this.http.post<void>(`${this.base}/${id}/reset-password`, {});
  }

  unlock(id: number) {
    return this.http.post<void>(`${this.base}/${id}/unlock`, {});
  }
}
