import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideCheck,
  LucideCheckCircle,
  LucideCreditCard,
  LucideDownload,
  LucideEdit,
  LucideMail,
  LucideMapPin,
  LucidePackage,
  LucidePhone,
  LucideShare2,
  LucideShieldCheck,
  LucideTrash2,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { PurchaseOrder } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { PurchaseOrdersApi, PurchaseOrderResponse } from '../../core/api';

@Component({
  selector: 'app-purchase-order-detail-view',
  imports: [
    LucideAlertCircle,
    LucideArrowLeft,
    LucideCheck,
    LucideCheckCircle,
    LucideCreditCard,
    LucideDownload,
    LucideEdit,
    LucideMail,
    LucideMapPin,
    LucidePackage,
    LucidePhone,
    LucideShare2,
    LucideShieldCheck,
    LucideTrash2,
    LucideUser,
    LucideX,
  ],
  templateUrl: './purchase-order-detail-view.html',
})
export class PurchaseOrderDetailView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PurchaseOrdersApi);

  private rawId = 0;

  protected readonly order = signal<PurchaseOrder | undefined>(undefined);
  protected readonly loading = signal(true);

  protected readonly confirmDelete = signal(false);
  protected readonly copied = signal(false);

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id') ?? '';
    const id = parseInt(idStr, 10);
    if (!id || isNaN(id)) {
      this.loading.set(false);
      return;
    }
    this.rawId = id;
    this.api.getById(id).subscribe({
      next: (po) => {
        this.order.set(this.mapPO(po));
        this.loading.set(false);
      },
      error: (err) => {
        this.showToast(err?.error?.detail ?? 'Error al cargar la orden', 'error');
        this.loading.set(false);
      },
    });
  }

  private mapPO(po: PurchaseOrderResponse): PurchaseOrder {
    const statusMap: Record<string, PurchaseOrder['status']> = {
      DISPONIBLE: 'Disponible', USADA: 'Usada', PENDIENTE: 'Pendiente', CANCELADA: 'Cancelada',
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

  protected backToList(): void {
    this.store.navigate('purchase-orders');
  }

  protected print(): void {
    window.print();
  }

  protected async share(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  protected requestDelete(): void {
    if (!this.confirmDelete()) {
      this.confirmDelete.set(true);
      return;
    }
    if (!this.rawId) return;
    this.api.delete(this.rawId).subscribe({
      next: () => {
        this.showToast('Orden eliminada exitosamente', 'success');
        setTimeout(() => this.backToList(), 500);
      },
      error: (err) => {
        this.showToast(err?.error?.detail ?? 'Error al eliminar la orden', 'error');
        this.confirmDelete.set(false);
      },
    });
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
