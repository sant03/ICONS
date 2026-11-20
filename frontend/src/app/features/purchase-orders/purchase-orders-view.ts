import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideCalendar,
  LucideFileText,
  LucidePlus,
  LucideSearch,
} from '@lucide/angular';
import { PurchaseOrder } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { PurchaseOrdersApi, PurchaseOrderResponse } from '../../core/api';

/**
 * "Todas las Órdenes de Compra" — first view of the Orden de Compra module.
 *
 * Ported 1:1 from "ICONS COMPLETE/src/views/PurchaseOrdersView.tsx" (VIEW 1:
 * grid list of purchase orders). The other two sub-views of that React screen
 * live here as their own routes: "Crear Nueva Orden de Compra" is the existing
 * `PurchaseOrderView` (`/purchase-order`) and the document detail is
 * `PurchaseOrderDetailView` (`/purchase-order-detail/:id`).
 */
@Component({
  selector: 'app-purchase-orders-view',
  imports: [FormsModule, LucideCalendar, LucideFileText, LucidePlus, LucideSearch],
  templateUrl: './purchase-orders-view.html',
})
export class PurchaseOrdersView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly router = inject(Router);
  private readonly api = inject(PurchaseOrdersApi);

  protected readonly purchaseOrders = signal<PurchaseOrder[]>([]);
  protected readonly searchTerm = signal('');

  ngOnInit(): void {
    this.api.list({ size: 200 }).subscribe({
      next: (page) => this.purchaseOrders.set(page.content.map((po) => PurchaseOrdersView.mapPO(po))),
    });
  }

  private static mapPO(po: PurchaseOrderResponse): PurchaseOrder {
    const statusMap: Record<string, PurchaseOrder['status']> = {
      AVAILABLE: 'Disponible', USED: 'Usada', PENDING: 'Pendiente', CANCELLED: 'Cancelada',
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

  /** Every card is a link to the document detail of that order. */
  protected openDetail(order: PurchaseOrder): void {
    void this.router.navigate(['/purchase-order-detail', order.orderNo]);
  }

  /** Maps the four states to the fixed badge palette (§7.5). */
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
}