import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface DispatchHistoryResponse {
  id: number;
  timestamp: string;
  event: string;
  actor: string;
}

export interface DispatchResponse {
  id: number;
  code: string;
  orderId: number | null;
  orderNumber: string;
  client: string;
  address: string;
  phone: string;
  zone: string;
  units: number;
  totalAmount: number;
  driverId: number | null;
  driverName: string | null;
  status: string;
  priority: string;
  scheduledDate: string;
  assignedAt: string | null;
  rejectedByDriverName: string | null;
  rejectionReason: string | null;
  notes: string | null;
  history: DispatchHistoryResponse[];
  createdAt: string;
}

export interface CreateDispatchRequest {
  orderId?: number;
  orderNumber?: string;
  client: string;
  address: string;
  phone?: string;
  zone?: string;
  units: number;
  totalAmount?: number;
  driverId?: number;
  priority?: string;
  scheduledDate: string;
  notes?: string;
}

export interface AssignDriverRequest {
  driverId?: number;
  userId?: number;
}

@Injectable({ providedIn: 'root' })
export class DispatchesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dispatches`;

  list(params?: { search?: string; status?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.status) p = p.set('status', params.status);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<DispatchResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<DispatchResponse>(`${this.base}/${id}`);
  }

  create(body: CreateDispatchRequest) {
    return this.http.post<DispatchResponse>(this.base, body);
  }

  assignDriver(id: number, body: AssignDriverRequest) {
    return this.http.patch<DispatchResponse>(`${this.base}/${id}/assign`, body);
  }

  updateStatus(id: number, status: string, rejectionReason?: string) {
    let p = new HttpParams().set('status', status);
    if (rejectionReason) p = p.set('rejectionReason', rejectionReason);
    return this.http.patch<DispatchResponse>(`${this.base}/${id}/status`, null, { params: p });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
