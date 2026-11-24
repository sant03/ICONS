import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface DeliveryDriverResponse {
  id: number;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  zone: string;
  status: string;
  avatarInitials: string;
  createdAt: string;
}

export interface CreateDriverRequest {
  name: string;
  phone?: string;
  vehicle?: string;
  plate?: string;
  zone?: string;
}

export interface UpdateDriverRequest {
  name?: string;
  phone?: string;
  vehicle?: string;
  plate?: string;
  zone?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class DriversApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/drivers`;

  list(params?: { status?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.status) p = p.set('status', params.status);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<DeliveryDriverResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<DeliveryDriverResponse>(`${this.base}/${id}`);
  }

  create(body: CreateDriverRequest) {
    return this.http.post<DeliveryDriverResponse>(this.base, body);
  }

  update(id: number, body: UpdateDriverRequest) {
    return this.http.put<DeliveryDriverResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
