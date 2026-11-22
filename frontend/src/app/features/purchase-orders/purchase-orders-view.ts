import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAlertCircle,
  LucideCalendar,
  LucideCheckCircle,
  LucideFileText,
  LucidePlus,
  LucideRotateCcw,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { PurchaseOrder } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { PurchaseOrdersApi, PurchaseOrderResponse } from '../../core/api';

@Component({
  selector: 'app-purchase-orders-view',
  imports: [
    FormsModule,
    LucideAlertCircle,
    LucideCalendar,
    LucideCheckCircle,
    LucideFileText,
    LucidePlus,
    LucideRotateCcw,
    LucideSearch,
    LucideX,
  ],
  templateUrl: './purchase-orders-view.html',
})
export class PurchaseOrdersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly api = inject(PurchaseOrdersApi);

  protected readonly isLoading = signal(true);
  protected readonly purchaseOrders = signal<PurchaseOrder[]>([]);
  protected readonly searchTerm = signal('');

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => {
        this.purchaseOrders.set(page.content.map((po) => PurchaseOrdersView.mapPO(po)));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.showToast(err?.error?.detail ?? 'Error al cargar órdenes de compra', 'error');
      },
    });
  }

  private static mapPO(po: PurchaseOrderResponse): PurchaseOrder {
    const statusMap: Record<string, PurchaseOrder['status']> = {
      DISPONIBLE: 'Disponible', USADA: 'Usada', PENDIENTE: 'Pendiente', CANCELADA: 'Cancelada',
      Disponible: 'Disponible', Usada: 'Usada', Pendiente: 'Pendiente', Cancelada: 'Cancelada',
    };
    return {
      id: po.code ?? `Orden ${String(po.id).padStart(3, '0')}`,
      orderNo: String(po.id).padStart(3, '0'),
      date: po.date,
      madeOn: po.madeOn,
      receptionDate: po.receptionDate ?? '',
      status: statusMap[po.status] ?? 'Pendiente',
      supplier: po.supplierName,
      supplierAddress: po.supplierAddress ?? undefined,
      supplierPhone: po.supplierPhone ?? undefined,
      supplierEmail: po.supplierEmail ?? undefined,
      madeBy: po.madeBy,
      user: po.userUsername,
      area: po.area ?? '',
      paymentMethod: po.paymentMethod ?? '',
      items: po.items.map((i) => ({
        productId: String(i.productId),
        product: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
      total: po.total,
      totalProducts: po.totalProducts,
      approvedBy: po.approvedBy ?? undefined,
    };
  }

  protected readonly filteredOrders = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.purchaseOrders();
    return this.purchaseOrders().filter(
      (po) =>
        po.id.toLowerCase().includes(query) || po.supplier.toLowerCase().includes(query),
    );
  });

  protected readonly availableCount = computed(
    () => this.purchaseOrders().filter((po) => po.status === 'Disponible').length,
  );

  protected openDetail(order: PurchaseOrder): void {
    void this.router.navigate(['/purchase-order-detail', order.orderNo]);
  }

  protected statusBadgeClass(status: PurchaseOrder['status']): string {
    const base =
      'px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase rounded-full border ';
    switch (status) {
      case 'Disponible':
        return base + 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pendiente':
        return base + 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Cancelada':
        return base + 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return base + 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-color)]';
    }
  }

  protected formatMoney(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
  }

  protected showToast(message: string, type: 'success' | 'error'): void {
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
