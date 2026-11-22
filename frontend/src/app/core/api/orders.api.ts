import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface CustomerOrderResponse {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  date: string;
  status: string;
  totalUnits: number;
  totalAmount: number;
  itemsSummary: string | null;
  saleIds: number[];
  createdAt: string;
}

export interface CreateOrderRequest {
  customerId?: number;
  customerName: string;
  date: string;
  itemsSummary?: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/orders`;

  list(params?: { search?: string; status?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.status) p = p.set('status', params.status);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<CustomerOrderResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<CustomerOrderResponse>(`${this.base}/${id}`);
  }

  create(body: CreateOrderRequest) {
    return this.http.post<CustomerOrderResponse>(this.base, body);
  }

  linkSale(orderId: number, saleId: number) {
    return this.http.post<CustomerOrderResponse>(`${this.base}/${orderId}/sales/${saleId}`, {});
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<CustomerOrderResponse>(`${this.base}/${id}/status`, { status });
  }
}
