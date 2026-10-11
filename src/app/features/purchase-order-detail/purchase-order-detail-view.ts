import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideDownload,
  LucideEdit,
  LucideMail,
  LucideMapPin,
  LucidePhone,
  LucideShare2,
  LucideTrash2,
} from '@lucide/angular';
import { PurchaseOrder } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

/**
 * Document detail of one Orden de Compra ("Documento Orden de Compra").
 *
 * Ported 1:1 from "ICONS COMPLETE/src/views/PurchaseOrdersView.tsx" (VIEW 3).
 * The React screen kept list / create / detail in a single `subView` state;
 * here each of them is its own route, so the detail reads the order number
 * from the URL and every mutation returns to the list.
 */
@Component({
  selector: 'app-purchase-order-detail-view',
  imports: [
    LucideArrowLeft,
    LucideCheck,
    LucideDownload,
    LucideEdit,
    LucideMail,
    LucideMapPin,
    LucidePhone,
    LucideShare2,
    LucideTrash2,
  ],
  templateUrl: './purchase-order-detail-view.html',
})
export class PurchaseOrderDetailView {
  protected readonly store = inject(AppStore);
  private readonly route = inject(ActivatedRoute);

  /** Order number of the URL (`/purchase-order-detail/003`). */
  private readonly orderNo = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  protected readonly order = computed<PurchaseOrder | undefined>(() =>
    this.store
      .purchaseOrders()
      .find((po) => po.orderNo === this.orderNo() || po.id === this.orderNo()),
  );

  /** Two-step delete: the first click arms the button, the second one deletes. */
  protected readonly confirmDelete = signal(false);

  /** Feedback of the share button once the link reached the clipboard. */
  protected readonly copied = signal(false);

  protected backToList(): void {
    this.store.navigate('purchase-orders');
  }

  protected print(): void {
    window.print();
  }

  /** Replaces the `alert(...)` of the original: copies the link and confirms in-place. */
  protected async share(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard blocked (no permission / insecure context): still confirm the action.
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  /** Deletes the document and returns to the list, like the original did. */
  protected requestDelete(): void {
    if (!this.confirmDelete()) {
      this.confirmDelete.set(true);
      return;
    }
    const po = this.order();
    if (po) this.store.deletePurchaseOrder(po.id);
    this.backToList();
  }

  protected statusBadgeClass(status: PurchaseOrder['status']): string {
    const base =
      'px-3 py-1 text-[10px] font-mono font-extrabold uppercase rounded-full border ';
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