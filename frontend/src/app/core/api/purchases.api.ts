import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface PurchaseItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseResponse {
  id: number;
  code: string;
  supplierId: number;
  supplierName: string;
  date: string;
  total: number;
  status: string;
  notes: string | null;
  cancelledAt: string | null;
  items: PurchaseItemResponse[];
  createdAt: string;
}

export interface CreatePurchaseRequest {
  supplierId: number;
  supplierName: string;
  date: string;
  notes?: string;
  items: { productId: number; quantity: number; unitPrice: number }[];
}

@Injectable({ providedIn: 'root' })
export class PurchasesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/purchases`;

  list(params?: { search?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<PurchaseResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<PurchaseResponse>(`${this.base}/${id}`);
  }

  create(body: CreatePurchaseRequest) {
    return this.http.post<PurchaseResponse>(this.base, body);
  }

  cancel(id: number) {
    return this.http.post<PurchaseResponse>(`${this.base}/${id}/cancel`, {});
  }
}
