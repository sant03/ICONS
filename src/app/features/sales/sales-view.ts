import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertCircle,
  LucideArrowUpDown,
  LucideCalendar,
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

/** Sort options of the "Ordenar Por" modal (ported from `sortOption`). */
type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'alpha_asc'
  | 'alpha_desc'
  | 'amount_desc'
  | 'amount_asc';

/**
 * Sales module: base layout ported from "ICONS UI V.2/src/components/SalesView.tsx"
 * (KPI cards + filter/search bar), extended with the columns and actions of
 * "ICONS COMPLETE/src/views/SalesView.tsx": "ESTADO DE PAGO", "ACCIONES"
 * (edit / delete), row selection + "Agrupar en Pedido" and the "Ordenar Por" modal.
 */
@Component({
  selector: 'app-sales-view',
  imports: [
    FormsModule,
    LucideAlertCircle,
    LucideArrowUpDown,
    LucideCalendar,
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
export class SalesView {
  protected readonly store = inject(AppStore);

  protected readonly searchTerm = signal('');
  protected readonly selectedFilter = signal<string>('all');
  /** Same fixed "today" label the header and the Today section use. */
  protected readonly todayLabel = 'September 27, 2026';

  // Grouping / sorting / row actions (ported from "ICONS COMPLETE/src/views/SalesView.tsx")
  protected readonly selectedSaleIds = signal<string[]>([]);
  protected readonly sortOption = signal<SortOption>('date_desc');
  protected readonly isSortModalOpen = signal(false);
  protected readonly editForm = signal<SaleRecord | null>(null);
  protected readonly deleteSaleId = signal<string | null>(null);
  protected readonly isGroupModalOpen = signal(false);
  protected readonly isGroupAlertVisible = signal(false);
  protected readonly groupClient = signal('');
  protected readonly groupPaymentStatus = signal<PaymentStatus>('Pagado');

  protected readonly filteredTodaySales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.store.todaySales().filter(
      (s) =>
        s.client.toLowerCase().includes(term) ||
        s.product.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term),
    );
  });

  protected readonly filteredHistoricalSales = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.store.historicalSales().filter(
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

  /** Every sale currently in the store (today + historical) for the selection helpers. */
  protected readonly selectedSales = computed<SaleRecord[]>(() => {
    const ids = new Set(this.selectedSaleIds());
    return [...this.store.todaySales(), ...this.store.historicalSales()].filter((s) =>
      ids.has(s.id),
    );
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

  /** "Agrupar en Pedido": warns when nothing is selected, otherwise opens the modal. */
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

  /** Creates the order from the selected sales, drops the records and opens Pedidos. */
  protected saveGroupedOrder(): void {
    const selected = this.selectedSales();
    if (selected.length === 0) return;

    const order: OrderItem = {
      id: `g-${Date.now()}`,
      orderNumber: `Pedido ${this.store.orders().length + 1}`,
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

  /** Recalculates the total on every change (quantity x unit price), as the source does. */
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
    this.store.updateSale(form.id, form);
    this.editForm.set(null);
  }

  protected askDelete(id: string): void {
    this.deleteSaleId.set(id);
  }

  protected confirmDelete(): void {
    const id = this.deleteSaleId();
    if (!id) return;
    this.store.deleteSale(id);
    this.selectedSaleIds.update((ids) => ids.filter((item) => item !== id));
    this.deleteSaleId.set(null);
  }

  protected exportCsv(): void {
    const csv =
      'ID,Client,Product,Quantity,UnitPrice,Total,Date,PaymentStatus\n' +
      [...this.store.todaySales(), ...this.store.historicalSales()]
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

  /** Accepts the ISO dates of today's records and the DD/MM/YYYY ones of the archive. */
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
}