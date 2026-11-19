import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  salesToday: { total: number; count: number };
  stockAlert: { outOfStock: number; lowStock: number };
  pendingOrders: number;
  newCustomersThisMonth: number;
  recentTransactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: string;
  module: string;
  description: string;
  status: string;
  amount: number;
  date: string;
  client: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getStats() {
    return this.http.get<DashboardStats>(`${this.base}/stats`);
  }
}
