import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface ProductResponse {
  id: number;
  code: string;
  reference: string;
  categoryId: number;
  categoryName: string;
  stock: number;
  minPurchase: number;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  imageUrl: string | null;
  blocked: boolean;
  status: string;
  createdAt: string;
}

export interface CreateProductRequest {
  reference: string;
  categoryId: number;
  stock: number;
  minPurchase: number;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  reference?: string;
  categoryId?: number;
  stock?: number;
  minPurchase?: number;
  purchasePrice?: number;
  salePrice?: number;
  unit?: string;
  imageUrl?: string;
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  type: string;
  quantity: number;
  stockAfter: number;
  referenceType: string | null;
  referenceId: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  list(params?: { search?: string; categoryId?: number; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.categoryId != null) p = p.set('categoryId', params.categoryId);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<ProductResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<ProductResponse>(`${this.base}/${id}`);
  }

  create(body: CreateProductRequest) {
    return this.http.post<ProductResponse>(this.base, body);
  }

  update(id: number, body: UpdateProductRequest) {
    return this.http.put<ProductResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  toggleBlock(id: number) {
    return this.http.patch<ProductResponse>(`${this.base}/${id}/toggle-block`, {});
  }

  adjustStock(id: number, type: string, quantity: number, notes?: string) {
    return this.http.post<StockMovementResponse>(`${this.base}/${id}/stock-adjustment`, {
      type, quantity, notes,
    });
  }

  getMovements(id: number, params?: { page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<StockMovementResponse>>(`${this.base}/${id}/movements`, { params: p });
  }
}
