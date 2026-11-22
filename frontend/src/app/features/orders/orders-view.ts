import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideAlertCircle,
  LucideArrowUpDown,
  LucideBox,
  LucideCalendar,
  LucideCheckCircle,
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
import { CustomersApi, CustomerResponse } from '../../core/api/customers.api';

type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc';

@Component({
  selector: 'app-orders-view',
  imports: [
    FormsModule,
    CustomSelectComponent,
    LucideAlertCircle,
    LucideArrowUpDown,
    LucideBox,
    LucideCalendar,
    LucideCheckCircle,
    LucideDatabase,
    LucideFilter,
    LucidePlus,
    LucideSearch,
    LucideUser,
    LucideX,
  ],
  templateUrl: './orders-view.html',
})
export class OrdersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(OrdersApi);
  private readonly customersApi = inject(CustomersApi);

  protected readonly isLoading = signal(true);
  protected readonly orders = signal<OrderItem[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedOrder = signal<OrderItem | null>(null);
  protected readonly isModalOpen = signal(false);
  protected readonly sortOption = signal<SortOption>('date_desc');
  protected readonly isSortModalOpen = signal(false);

  protected readonly apiCustomers = signal<CustomerResponse[]>([]);
  protected readonly clientName = signal('');
  protected readonly submitting = signal(false);

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly customerOptions = computed(() =>
    this.apiCustomers().map((c) => c.name),
  );

  protected readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date_desc', label: 'Más recientes' },
    { value: 'date_asc', label: 'Más antiguos' },
    { value: 'alpha_asc', label: 'Cliente A-Z' },
    { value: 'alpha_desc', label: 'Cliente Z-A' },
  ];

  protected readonly statusOptions = ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadOrders();
    this.customersApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiCustomers.set(page.content),
    });
  }

  private loadOrders(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        this.orders.set(page.content.map((o) => OrdersView.mapOrder(o)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err?.error?.detail ?? 'Error al cargar pedidos', 'error');
      },
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
    const list = this.orders().filter(
      (o) => o.orderNumber.toLowerCase().includes(term) || o.client.toLowerCase().includes(term),
    );
    return this.sortOrders(list);
  });

  private sortOrders(list: OrderItem[]): OrderItem[] {
    const option = this.sortOption();
    return [...list].sort((a, b) => {
      switch (option) {
        case 'alpha_asc':
          return a.client.localeCompare(b.client);
        case 'alpha_desc':
          return b.client.localeCompare(a.client);
        case 'date_asc':
          return a.date.localeCompare(b.date);
        default:
          return b.date.localeCompare(a.date);
      }
    });
  }

  protected handleCreateOrderSubmit(): void {
    if (!this.clientName().trim()) return;
    if (this.submitting()) return;

    this.submitting.set(true);

    const customer = this.apiCustomers().find((c) => c.name === this.clientName().trim());

    this.api.create({
      customerId: customer?.id,
      customerName: this.clientName().trim(),
      date: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: () => {
        this.showToast('Pedido creado exitosamente', 'success');
        this.loadOrders();
        this.clientName.set('');
        this.isModalOpen.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.showToast(err?.error?.detail ?? 'Error al crear el pedido', 'error');
        this.submitting.set(false);
      },
    });
  }

  protected updateOrderStatus(order: OrderItem, newStatus: string): void {
    this.api.updateStatus(Number(order.id), newStatus).subscribe({
      next: (res) => {
        const updated = OrdersView.mapOrder(res);
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.selectedOrder.set(updated);
        this.showToast('Estado actualizado exitosamente', 'success');
      },
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al actualizar estado', 'error'),
    });
  }

  protected formatMoney(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastOpen.set(true);
    this.toastTimer = setTimeout(() => this.toastOpen.set(false), 4000);
  }

  protected closeToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastOpen.set(false);
  }
}
