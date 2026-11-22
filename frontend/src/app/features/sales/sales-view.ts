import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideAlertCircle,
  LucideArrowUpDown,
  LucideCalendar,
  LucideCheckCircle,
  LucideChevronDown,
  LucideDollarSign,
  LucideDownload,
  LucideEdit,
  LucideFilter,
  LucideFolderPlus,
  LucideLayers,
  LucidePlus,
  LucideSearch,
  LucideShoppingBag,
  LucideTag,
  LucideTrash2,
  LucideTrendingUp,
  LucideX,
} from '@lucide/angular';
import { OrderItem, PaymentStatus, SaleRecord } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';
import { SalesApi, SaleResponse } from '../../core/api';

type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'alpha_asc'
  | 'alpha_desc'
  | 'amount_desc'
  | 'amount_asc';

@Component({
  selector: 'app-sales-view',
  imports: [
    FormsModule,
    CustomSelectComponent,
    LucideAlertCircle,
    LucideArrowUpDown,
    LucideCalendar,
    LucideCheckCircle,
    LucideChevronDown,
    LucideDollarSign,
    LucideDownload,
    LucideEdit,
    LucideFilter,
    LucideFolderPlus,
    LucideLayers,
    LucidePlus,
    LucideSearch,
    LucideShoppingBag,
    LucideTag,
    LucideTrash2,
    LucideTrendingUp,
    LucideX,
  ],
  templateUrl: './sales-view.html',
})
export class SalesView implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(SalesApi);

  protected readonly allSales = signal<SaleRecord[]>([]);
  protected readonly searchTerm = signal('');
  protected readonly selectedFilter = signal<string>('all');
  protected readonly todayLabel = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  protected readonly selectedSaleIds = signal<string[]>([]);
  protected readonly sortOption = signal<SortOption>('date_desc');
  protected readonly isSortModalOpen = signal(false);
  protected readonly editForm = signal<SaleRecord | null>(null);
  protected readonly deleteSaleId = signal<string | null>(null);
  protected readonly deleteSaleBackendId = signal<number | null>(null);
  protected readonly isGroupModalOpen = signal(false);
  protected readonly isGroupAlertVisible = signal(false);
  protected readonly groupClient = signal('');
  protected readonly groupPaymentStatus = signal<PaymentStatus>('Pagado');
  protected readonly paymentStatusOptions = ['Pagado', 'Debe'];

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly totalRevenue = computed(() =>
    this.allSales().reduce((sum, s) => sum + s.total, 0),
  );

  protected readonly totalRevenueFormatted = computed(() =>
    this.totalRevenue().toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  );

  protected readonly avgTicket = computed(() => {
    const sales = this.allSales();
    return sales.length ? this.totalRevenue() / sales.length : 0;
  });

  protected readonly avgTicketFormatted = computed(() =>
    Math.round(this.avgTicket()).toLocaleString('es-CO'),
  );

  constructor() {
    effect(() => {
      this.store.saleCreatedTick();
      this.loadSales();
    });
  }

  ngOnInit(): void {
    this.loadSales();
  }

  private loadSales(): void {
    this.api.list({ size: 500 }).subscribe({
      next: (page) => this.allSales.set(page.content.map((s) => SalesView.mapSale(s))),
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al cargar ventas', 'error'),
    });
  }

  private static mapSale(s: SaleResponse): SaleRecord {
    const firstItem = s.items[0];
    return {
      id: s.code ?? String(s.id),
      backendId: s.id,
      client: s.customerName,
      product: firstItem?.productName ?? '(varios)',
      quantity: firstItem?.quantity ?? s.items.reduce((sum, i) => sum + i.quantity, 0),
      unitPrice: firstItem?.unitPrice ?? 0,
      total: s.total,
      date: s.date,
      code: s.code,
      status: s.status === 'CANCELLED' ? 'Reembolsado' : s.amountDue > 0 ? 'Pendiente' : 'Completado',
      paymentStatus: s.paymentStatus === 'PAGADO' ? 'Pagado' : 'Debe',
      amountDue: s.amountDue,
      notes: s.notes ?? undefined,
    };
  }

  private readonly todayStr = new Date().toISOString().slice(0, 10);

  protected readonly filteredTodaySales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allSales()
      .filter((s) => s.date === this.todayStr)
      .filter(
        (s) =>
          s.client.toLowerCase().includes(term) ||
          s.product.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term),
      );
  });

  protected readonly filteredHistoricalSales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allSales()
      .filter((s) => s.date !== this.todayStr)
      .filter(
        (s) =>
          s.client.toLowerCase().includes(term) ||
          s.product.toLowerCase().includes(term) ||
          (s.code && s.code.toLowerCase().includes(term)),
      );
  });

  protected readonly sortedTodaySales = computed(() =>
    this.sortSales(this.filteredTodaySales()),
  );

  protected readonly sortedHistoricalSales = computed(() =>
    this.sortSales(this.filteredHistoricalSales()),
  );

  protected readonly selectedSales = computed<SaleRecord[]>(() => {
    const ids = new Set(this.selectedSaleIds());
    return this.allSales().filter((s) => ids.has(s.id));
  });

  protected readonly selectedUnits = computed(() =>
    this.selectedSales().reduce((sum, s) => sum + s.quantity, 0),
  );

  protected readonly selectedTotal = computed(() =>
    this.selectedSales().reduce((sum, s) => sum + s.total, 0),
  );

  protected isSelected(id: string): boolean {
    return this.selectedSaleIds().includes(id);
  }

  protected isAllSelected(list: SaleRecord[]): boolean {
    return list.length > 0 && list.every((s) => this.selectedSaleIds().includes(s.id));
  }

  protected toggleSelectSale(id: string): void {
    this.selectedSaleIds.update((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }

  protected toggleSelectAll(list: SaleRecord[]): void {
    const allIds = list.map((s) => s.id);
    const everySelected = allIds.every((id) => this.selectedSaleIds().includes(id));
    this.selectedSaleIds.update((ids) =>
      everySelected ? ids.filter((id) => !allIds.includes(id)) : [...new Set([...ids, ...allIds])],
    );
  }

  protected openGroupModal(): void {
    const selected = this.selectedSales();
    if (selected.length === 0) {
      this.isGroupAlertVisible.set(true);
      return;
    }
    this.groupClient.set(selected[0].client);
    this.groupPaymentStatus.set('Pagado');
    this.isGroupModalOpen.set(true);
  }

  protected dismissGroupAlert(): void {
    this.isGroupAlertVisible.set(false);
  }

  protected saveGroupedOrder(): void {
    const selected = this.selectedSales();
    if (selected.length === 0) return;

    const order: OrderItem = {
      id: `g-${Date.now()}`,
      orderNumber: `Pedido ${Date.now()}`,
      status: this.groupPaymentStatus() === 'Pagado' ? 'COMPLETED' : 'PENDING',
      client: this.groupClient() || 'Cliente Varios',
      date: new Date().toLocaleDateString('es-ES'),
      units: this.selectedUnits(),
      totalAmount: this.selectedTotal(),
      itemsSummary: selected.map((s) => `${s.quantity} x ${s.product}`).join(', '),
    };

    this.store.createOrderFromSales(order, this.selectedSaleIds());
    this.selectedSaleIds.set([]);
    this.isGroupModalOpen.set(false);
    this.store.navigate('orders');
  }

  protected openEditModal(sale: SaleRecord): void {
    this.editForm.set({ ...sale });
  }

  protected patchEditForm(patch: Partial<SaleRecord>): void {
    const current = this.editForm();
    if (!current) return;
    const next: SaleRecord = { ...current, ...patch };
    next.total = next.quantity * next.unitPrice;
    if (next.paymentStatus === 'Pagado') next.amountDue = 0;
    this.editForm.set(next);
  }

  protected saveEdit(): void {
    const form = this.editForm();
    if (!form) return;
    this.allSales.update((list) => list.map((s) => (s.id === form.id ? form : s)));
    this.editForm.set(null);
  }

  protected askDelete(sale: SaleRecord): void {
    this.deleteSaleId.set(sale.id);
    this.deleteSaleBackendId.set(sale.backendId ?? null);
  }

  protected confirmDelete(): void {
    const id = this.deleteSaleId();
    const backendId = this.deleteSaleBackendId();
    if (!id) return;

    if (backendId) {
      this.api.cancel(backendId).subscribe({
        next: () => {
          this.showToast('Venta cancelada exitosamente', 'success');
          this.loadSales();
        },
        error: (err) => this.showToast(err?.error?.detail ?? 'Error al cancelar la venta', 'error'),
      });
    } else {
      this.allSales.update((list) => list.filter((s) => s.id !== id));
    }

    this.selectedSaleIds.update((ids) => ids.filter((item) => item !== id));
    this.deleteSaleId.set(null);
    this.deleteSaleBackendId.set(null);
  }

  protected formatMoney(value: number): string {
    return `$${value.toLocaleString('es-CO')}`;
  }

  protected exportCsv(): void {
    const csv =
      'ID,Client,Product,Quantity,UnitPrice,Total,Date,PaymentStatus\n' +
      this.allSales()
        .map(
          (s) =>
            `${s.id},${s.client},${s.product},${s.quantity},$${s.unitPrice},$${s.total},${s.date},${s.paymentStatus}`,
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_records.csv';
    a.click();
  }

  private static dateValue(date: string): number {
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])).getTime();
    const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
    if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1])).getTime();
    return 0;
  }

  private sortSales(list: SaleRecord[]): SaleRecord[] {
    const option = this.sortOption();
    return [...list].sort((a, b) => {
      switch (option) {
        case 'amount_desc':
          return b.total - a.total;
        case 'amount_asc':
          return a.total - b.total;
        case 'alpha_asc':
          return a.client.localeCompare(b.client);
        case 'alpha_desc':
          return b.client.localeCompare(a.client);
        case 'date_asc':
          return SalesView.dateValue(a.date) - SalesView.dateValue(b.date);
        default:
          return SalesView.dateValue(b.date) - SalesView.dateValue(a.date);
      }
    });
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
