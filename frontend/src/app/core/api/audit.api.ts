import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface AuditLogResponse {
  id: number;
  userId: number;
  username: string;
  action: string;
  category: string;
  entityType: string | null;
  entityId: number | null;
  description: string;
  ipAddress: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuditApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/audit`;

  list(params?: { search?: string; category?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.search) p = p.set('search', params.search);
    if (params?.category) p = p.set('category', params.category);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<AuditLogResponse>>(this.base, { params: p });
  }

  clearAll() {
    return this.http.delete<void>(this.base);
  }
}
