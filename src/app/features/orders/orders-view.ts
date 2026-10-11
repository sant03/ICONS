import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

type NewOrderStatus = 'COMPLETED' | 'PENDING' | 'SHIPPED';

@Component({
  selector: 'app-orders-view',
  imports: [
    FormsModule,
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
export class OrdersView {
  protected readonly store = inject(AppStore);

  protected readonly searchTerm = signal('');
  protected readonly selectedOrder = signal<OrderItem | null>(null);
  protected readonly isModalOpen = signal(false);

  // New Order Form state
  protected readonly clientName = signal('');
  protected readonly units = signal(10);
  protected readonly status = signal<NewOrderStatus>('PENDING');

  protected readonly filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.store
      .orders()
      .filter(
        (o) => o.orderNumber.toLowerCase().includes(term) || o.client.toLowerCase().includes(term),
      );
  });

  protected handleCreateOrderSubmit(): void {
    if (!this.clientName()) return;
    const newOrd: OrderItem = {
      id: Date.now().toString(),
      orderNumber: `Pedido ${this.store.orders().length + 1}`,
      status: this.status(),
      client: this.clientName(),
      date: new Date().toLocaleDateString('es-ES'),
      units: this.units(),
      totalAmount: this.units() * 400,
    };
    this.store.addOrder(newOrd);
    this.clientName.set('');
    this.isModalOpen.set(false);
  }
}
