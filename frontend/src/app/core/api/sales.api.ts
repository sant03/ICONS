import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface SaleItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleResponse {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  date: string;
  subtotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: string;
  status: string;
  notes: string | null;
  cancelledAt: string | null;
  items: SaleItemResponse[];
  createdAt: string;
}

export interface CreateSaleRequest {
  customerId?: number;
  customerName: string;
  date: string;
  amountPaid: number;
  notes?: string;
  items: { productId: number; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class SalesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sales`;

  list(params?: { search?: string; customerId?: number; paymentStatus?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.customerId != null) p = p.set('customerId', params.customerId);
    if (params?.paymentStatus) p = p.set('paymentStatus', params.paymentStatus);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<SaleResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<SaleResponse>(`${this.base}/${id}`);
  }

  create(body: CreateSaleRequest) {
    return this.http.post<SaleResponse>(this.base, body);
  }

  addPayment(id: number, amount: number) {
    return this.http.post<SaleResponse>(`${this.base}/${id}/payment`, { amount });
  }

  cancel(id: number) {
    return this.http.post<SaleResponse>(`${this.base}/${id}/cancel`, {});
  }
}
