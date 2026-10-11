import { Component, computed, inject, signal } from '@angular/core';
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
export class PurchaseOrdersView {
  protected readonly store = inject(AppStore);
  private readonly router = inject(Router);

  /** Mirrors the `searchQuery` prop of the original component. */
  protected readonly searchTerm = signal('');

  protected readonly filteredOrders = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    if (!query) return this.store.purchaseOrders();
    return this.store
      .purchaseOrders()
      .filter(
        (po) =>
          po.id.toLowerCase().includes(query) || po.supplier.toLowerCase().includes(query),
      );
  });

  /** Counts of the documents by state, shown in the footer indicators. */
  protected readonly availableCount = computed(
    () => this.store.purchaseOrders().filter((po) => po.status === 'Disponible').length,
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