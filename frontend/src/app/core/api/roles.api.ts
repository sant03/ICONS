import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  system: boolean;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: number;
  code: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionCodes?: string[];
}

@Injectable({ providedIn: 'root' })
export class RolesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;

  list() {
    return this.http.get<RoleResponse[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<RoleResponse>(`${this.base}/${id}`);
  }

  create(body: CreateRoleRequest) {
    return this.http.post<RoleResponse>(this.base, body);
  }

  update(id: number, body: UpdateRoleRequest) {
    return this.http.put<RoleResponse>(`${this.base}/${id}`, body);
  }

  listPermissions() {
    return this.http.get<PermissionResponse[]>(`${this.base}/permissions`);
  }
}
