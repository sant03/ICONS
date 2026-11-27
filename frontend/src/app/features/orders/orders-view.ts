import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
  LucideShoppingBag,
  LucideTrash2,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { OrderItem } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { OrdersApi, CustomerOrderResponse } from '../../core/api';
import { CustomersApi, CustomerResponse } from '../../core/api/customers.api';
import { ProductsApi, ProductResponse } from '../../core/api/products.api';

type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc';

interface OrderLineItem {
  productId: number;
  name: string;
  code: string;
  quantity: number;
  unitPrice: number;
}

type ModalPaymentStatus = 'Pagado' | 'Pendiente' | 'Abono';

@Component({
  selector: 'app-orders-view',
  imports: [
    DecimalPipe,
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
    LucideShoppingBag,
    LucideTrash2,
    LucideUser,
    LucideX,
  ],
  templateUrl: './orders-view.html',
})
export class OrdersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(OrdersApi);
  private readonly customersApi = inject(CustomersApi);
  private readonly productsApi = inject(ProductsApi);

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
  protected readonly filterStatus = signal<string>('all');
  protected readonly isFilterModalOpen = signal(false);

  protected readonly filterStatusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SHIPPED', label: 'Enviado' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  // ── Multi-product create modal state ──
  protected readonly apiProducts = signal<ProductResponse[]>([]);
  protected readonly modalClientName = signal('');
  protected readonly modalOrderDate = signal(new Date().toISOString().split('T')[0]);
  protected readonly modalOrderCode = signal('');
  protected readonly modalPaymentStatus = signal<ModalPaymentStatus>('Pagado');
  protected readonly modalComments = signal('');
  protected readonly modalSelectedProductId = signal<number | null>(null);
  protected readonly modalItemQty = signal(1);
  protected readonly modalOrderLineItems = signal<OrderLineItem[]>([]);

  protected readonly productOptions = computed(() =>
    this.apiProducts()
      .filter((p) => !p.blocked && p.stock > 0)
      .map((p) => ({ value: p.id, label: `${p.reference} / ${p.code} ($${p.salePrice.toLocaleString()})` })),
  );

  protected readonly modalSelectedProduct = computed(() => {
    const id = this.modalSelectedProductId();
    return id != null ? this.apiProducts().find((p) => p.id === Number(id)) : undefined;
  });

  protected readonly modalComputedTotalUnits = computed(() =>
    this.modalOrderLineItems().reduce((sum, i) => sum + i.quantity, 0),
  );

  protected readonly modalComputedTotalAmount = computed(() =>
    this.modalOrderLineItems().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  ngOnInit(): void {
    this.loadOrders();
    this.customersApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiCustomers.set(page.content),
    });
    this.productsApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiProducts.set(page.content),
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
      paymentStatus: o.paymentStatus ?? undefined,
      comments: o.comments ?? undefined,
      items: (o.items ?? []).map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productCode: i.productCode,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
    };
  }

  protected readonly filteredOrders = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();
    const list = this.orders().filter((o) => {
      const matchesTerm =
        o.orderNumber.toLowerCase().includes(term) || o.client.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || o.status === status;
      return matchesTerm && matchesStatus;
    });
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
    if (!this.modalClientName().trim()) {
      this.showToast('Selecciona un cliente', 'error');
      return;
    }
    if (this.modalOrderLineItems().length === 0) {
      this.showToast('Añade al menos un producto al pedido', 'error');
      return;
    }
    if (this.submitting()) return;

    this.submitting.set(true);

    const customer = this.apiCustomers().find((c) => c.name === this.modalClientName().trim());
    const lineItems = this.modalOrderLineItems();
    const itemsSummary = lineItems.map((i) => `${i.name} × ${i.quantity}`).join(', ');
    const date = this.modalOrderDate() || new Date().toISOString().split('T')[0];

    this.api.create({
      customerId: customer?.id,
      customerName: this.modalClientName().trim(),
      date,
      paymentStatus: this.modalPaymentStatus(),
      comments: this.modalComments().trim() || undefined,
      itemsSummary,
      items: lineItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }).subscribe({
      next: () => {
        this.showToast('Pedido creado exitosamente', 'success');
        this.loadOrders();
        this.isModalOpen.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.showToast(err?.error?.detail ?? 'Error al crear el pedido', 'error');
        this.submitting.set(false);
      },
    });
  }

  protected openCreateModal(): void {
    this.modalClientName.set('');
    this.modalOrderDate.set(new Date().toISOString().split('T')[0]);
    this.modalOrderCode.set(String(this.orders().length + 1));
    this.modalPaymentStatus.set('Pagado');
    this.modalComments.set('');
    this.modalSelectedProductId.set(null);
    this.modalItemQty.set(1);
    this.modalOrderLineItems.set([]);
    this.isModalOpen.set(true);
  }

  protected setModalItemQty(value: number): void {
    this.modalItemQty.set(Math.max(1, value));
  }

  protected handleAddLineItem(): void {
    const prod = this.modalSelectedProduct();
    if (!prod) {
      this.showToast('Selecciona un producto antes de añadir', 'error');
      return;
    }
    if (this.modalItemQty() <= 0) {
      this.showToast('La cantidad debe ser mayor a 0', 'error');
      return;
    }

    this.modalOrderLineItems.update((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id ? { ...i, quantity: i.quantity + this.modalItemQty() } : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.reference,
          code: prod.code,
          quantity: this.modalItemQty(),
          unitPrice: prod.salePrice,
        },
      ];
    });
    this.modalItemQty.set(1);
  }

  protected handleRemoveLineItem(productId: number): void {
    this.modalOrderLineItems.update((prev) => prev.filter((i) => i.productId !== productId));
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
