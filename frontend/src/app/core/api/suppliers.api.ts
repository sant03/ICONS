import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface SupplierResponse {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class SuppliersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/suppliers`;

  list(params?: { search?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<SupplierResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<SupplierResponse>(`${this.base}/${id}`);
  }

  create(body: CreateSupplierRequest) {
    return this.http.post<SupplierResponse>(this.base, body);
  }

  update(id: number, body: UpdateSupplierRequest) {
    return this.http.put<SupplierResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
