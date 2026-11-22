import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface PurchaseOrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrderResponse {
  id: number;
  code: string;
  supplierId: number;
  supplierName: string;
  supplierAddress: string | null;
  supplierPhone: string | null;
  supplierEmail: string | null;
  date: string;
  madeOn: string;
  receptionDate: string | null;
  status: string;
  madeBy: string;
  userUsername: string;
  area: string | null;
  paymentMethod: string | null;
  totalProducts: number;
  total: number;
  approvedBy: string | null;
  scheduledDate: string | null;
  items: PurchaseOrderItemResponse[];
  createdAt: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  supplierName: string;
  supplierAddress?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  date: string;
  madeOn: string;
  receptionDate?: string;
  madeBy: string;
  area?: string;
  paymentMethod?: string;
  approvedBy?: string;
  scheduledDate?: string;
  items: { productId: number; quantity: number; unitPrice: number }[];
}

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/purchase-orders`;

  list(params?: { search?: string; status?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.status) p = p.set('status', params.status);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<PurchaseOrderResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<PurchaseOrderResponse>(`${this.base}/${id}`);
  }

  create(body: CreatePurchaseOrderRequest) {
    return this.http.post<PurchaseOrderResponse>(this.base, body);
  }

  updateStatus(id: number, status: string) {
    return this.http.patch<PurchaseOrderResponse>(`${this.base}/${id}/status`, null, {
      params: new HttpParams().set('status', status),
    });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
