import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface CategoryResponse {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  list(params?: { page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<CategoryResponse>>(this.base, { params: p });
  }

  getById(id: number) {
    return this.http.get<CategoryResponse>(`${this.base}/${id}`);
  }

  create(name: string) {
    return this.http.post<CategoryResponse>(this.base, { name });
  }

  update(id: number, body: { name?: string; status?: string }) {
    return this.http.put<CategoryResponse>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
