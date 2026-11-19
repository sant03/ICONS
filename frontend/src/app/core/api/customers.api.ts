import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface CustomerResponse {
  id: number;
  name: string;
  docId: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  docId?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  docId?: string;
  phone?: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/customers`;

  list(params?: { search?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<CustomerResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<CustomerResponse>(`${this.base}/${id}`);
  }

  create(body: CreateCustomerRequest) {
    return this.http.post<CustomerResponse>(this.base, body);
  }

  update(id: number, body: UpdateCustomerRequest) {
    return this.http.put<CustomerResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
