import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageResponse } from './api.types';

export interface NotificationResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/notifications`;

  list(params?: { filter?: string; page?: number; size?: number }) {
    let p = new HttpParams();
    if (params?.filter) p = p.set('filter', params.filter);
    if (params?.page != null) p = p.set('page', params.page);
    if (params?.size != null) p = p.set('size', params.size);
    return this.http.get<PageResponse<NotificationResponse>>(this.base, { params: p });
  }

  unreadCount() {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`);
  }

  markAsRead(id: number) {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }

  markAllAsRead() {
    return this.http.patch<void>(`${this.base}/read-all`, {});
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  clearAll() {
    return this.http.delete<void>(this.base);
  }
}
