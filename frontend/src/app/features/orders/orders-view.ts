import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideArrowUpDown,
  LucideBox,
  LucideCalendar,
  LucideDatabase,
  LucideFilter,
  LucidePlus,
  LucideSearch,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { OrderItem } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { OrdersApi, CustomerOrderResponse } from '../../core/api';

type NewOrderStatus = 'COMPLETED' | 'PENDING' | 'SHIPPED';

@Component({
  selector: 'app-orders-view',
  imports: [
    FormsModule,
    CustomSelectComponent,
    LucideDatabase,
    LucideSearch,
    LucideArrowUpDown,
    LucideFilter,
    LucideBox,
    LucideUser,
    LucideCalendar,
    LucidePlus,
    LucideX,
  ],
  templateUrl: './orders-view.html',
})
export class OrdersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(OrdersApi);

  protected readonly orders = signal<OrderItem[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedOrder = signal<OrderItem | null>(null);
  protected readonly isModalOpen = signal(false);

  protected readonly clientName = signal('');
  protected readonly units = signal(10);
  protected readonly status = signal<NewOrderStatus>('PENDING');
  protected readonly orderStatusOptions = ['PENDING', 'SHIPPED', 'COMPLETED'];

  ngOnInit(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => this.orders.set(page.content.map((o) => OrdersView.mapOrder(o))),
    });
  }

  private static mapOrder(o: CustomerOrderResponse): OrderItem {
    return {
      id: String(o.id),
      orderNumber: o.code,
      status: (o.status as OrderItem['status']) ?? 'PENDING',
      client: o.customerName,
      date: o.date,
      units: o.totalUnits,
      totalAmount: o.totalAmount,
      itemsSummary: o.itemsSummary ?? undefined,
    };
  }

  protected readonly filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.orders().filter(
      (o) => o.orderNumber.toLowerCase().includes(term) || o.client.toLowerCase().includes(term),
    );
  });

  protected handleCreateOrderSubmit(): void {
    if (!this.clientName()) return;
    this.api.create({
      customerId: 0,
      customerName: this.clientName(),
      date: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: (res) => {
        this.orders.update((list) => [...list, OrdersView.mapOrder(res)]);
      },
    });
    this.clientName.set('');
    this.isModalOpen.set(false);
  }
}
