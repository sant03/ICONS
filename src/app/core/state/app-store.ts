import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import {
  AuditLog,
  Client,
  OrderItem,
  ProductCatalogItem,
  PurchaseOrder,
  SaleRecord,
  StaffMember,
  Supplier,
  ThemeMode,
  Transaction,
  UserProfile,
  ViewMode,
} from '../models/types';
import {
  historicalSalesRecords,
  initialClients,
  initialOrders,
  initialProducts,
  initialProductCategories,
  initialPurchaseOrders,
  initialStaff,
  initialSuppliers,
  initialTransactions,
  initialUserProfile,
  todaySalesRecords,
  userAuditLogs,
} from '../models/mock-data';

const ALL_VIEW_MODES: ViewMode[] = [
  'welcome',
  'login',
  'register',
  'dashboard',
  'sales',
  'orders',
  'purchase-orders',
  'purchase-order-detail',
  'purchase-order',
  'users',
  'profile',
  'products',
  'settings',
  'clients',
  'suppliers',
];

/**
 * Signal store that mirrors the state declared in the original `src/App.tsx`.
 *
 * Original React state -> Angular signal:
 *   theme                    -> theme
 *   transactions / todaySales / historicalSales / orders / products
 *   auditLogs / userProfile
 *   isNewSaleModalOpen
 *   currentView              -> handled by the Angular Router (see app.routes.ts)
 */
@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly router = inject(Router);

  readonly theme = signal<ThemeMode>('dark');
  readonly transactions = signal<Transaction[]>(structuredClone(initialTransactions));
  readonly todaySales = signal<SaleRecord[]>(structuredClone(todaySalesRecords));
  readonly historicalSales = signal<SaleRecord[]>(structuredClone(historicalSalesRecords));
  readonly orders = signal<OrderItem[]>(structuredClone(initialOrders));
  readonly products = signal<ProductCatalogItem[]>(structuredClone(initialProducts));
  /** Categorias del modulo Productos (chips de busqueda + modal "Nueva Categoria"). */
  readonly productCategories = signal<string[]>(structuredClone(initialProductCategories));
  readonly auditLogs = signal<AuditLog[]>(structuredClone(userAuditLogs));
  readonly userProfile = signal<UserProfile>(structuredClone(initialUserProfile));
  /** Personal list of the Users module (see mock-data `initialStaff`). */
  readonly staff = signal<StaffMember[]>(structuredClone(initialStaff));
  /** Clientes tab of the Clients/Prov module. */
  readonly clients = signal<Client[]>(structuredClone(initialClients));
  /** Proveedores tab of the Clients/Prov module. */
  readonly suppliers = signal<Supplier[]>(structuredClone(initialSuppliers));
  /** Documents of the Orden de Compra module (list + detail views). */
  readonly purchaseOrders = signal<PurchaseOrder[]>(structuredClone(initialPurchaseOrders));
  readonly isNewSaleModalOpen = signal(false);

  /** Drives the `${theme}` class that the original appended to the root container. */
  readonly themeClass = computed(() => this.theme());

  /** Reactive stand-in for the original `currentView` state. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly currentView = computed<ViewMode>(() => {
    const segment = this.currentUrl().split('?')[0].replace(/^\//, '').split('/')[0];
    const match = ALL_VIEW_MODES.find((view) => view === segment);
    return match ?? 'dashboard';
  });

  isViewActive(view: ViewMode): boolean {
    const current = this.currentView();
    // The personal profile belongs to the Users module: keep "Usuarios"
    // highlighted while /profile is on screen.
    if (view === 'users') {
      return current === 'users' || current === 'profile';
    }
    // The Clients/Prov sidebar entry covers both tabs of the module:
    // keep it highlighted while /clients or /suppliers is on screen.
    if (view === 'clients') {
      return current === 'clients' || current === 'suppliers';
    }
    // "Orden de Compra" opens the order list; the document detail and the
    // create form are part of the same module, so all three keep it highlighted.
    if (view === 'purchase-orders') {
      return (
        current === 'purchase-orders' ||
        current === 'purchase-order-detail' ||
        current === 'purchase-order'
      );
    }
    return current === view;
  }

  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  toggleTheme(): void {
    this.theme.update((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  /** Replaces the `onNavigate` callback of the original components. */
  navigate(view: ViewMode): void {
    this.closeSidebar();
    void this.router.navigate([`/${view}`]);
  }

  openNewSaleModal(): void {
    this.isNewSaleModalOpen.set(true);
  }

  closeNewSaleModal(): void {
    this.isNewSaleModalOpen.set(false);
  }

  addSale(newSale: SaleRecord, newTx: Transaction): void {
    this.todaySales.update((sales) => [newSale, ...sales]);
    this.transactions.update((tx) => [newTx, ...tx]);
  }

  addOrder(newOrder: OrderItem): void {
    this.orders.update((orders) => [newOrder, ...orders]);
  }

  /** Edit modal of the Sales module (ported from `onUpdateSale`). */
  updateSale(id: string, patch: Partial<SaleRecord>): void {
    const apply = (sale: SaleRecord): SaleRecord =>
      sale.id === id ? { ...sale, ...patch } : sale;
    this.todaySales.update((sales) => sales.map(apply));
    this.historicalSales.update((sales) => sales.map(apply));
  }

  /** Delete confirm modal of the Sales module (ported from `onDeleteSale`). */
  deleteSale(id: string): void {
    const drop = (sales: SaleRecord[]): SaleRecord[] => sales.filter((s) => s.id !== id);
    this.todaySales.update(drop);
    this.historicalSales.update(drop);
  }

  /**
   * "Agrupar en Pedido": stores the new order and removes the grouped records
   * from both sales tables (ported from `onCreateOrderFromSales(newOrder, ids)`).
   */
  createOrderFromSales(order: OrderItem, saleIds: string[]): void {
    const grouped = new Set(saleIds);
    const drop = (sales: SaleRecord[]): SaleRecord[] =>
      sales.filter((s) => !grouped.has(s.id));
    this.orders.update((orders) => [order, ...orders]);
    this.todaySales.update(drop);
    this.historicalSales.update(drop);
  }

  addProduct(newProd: ProductCatalogItem): void {
    this.products.update((products) => [
      { ...newProd, status: this.resolveProductStatus(newProd) },
      ...products,
    ]);
  }

  /**
   * "Editar Producto" del modulo Productos (portado de `onUpdateProduct`).
   * El estado de stock se recalcula con el minimo de compra del producto.
   */
  updateProduct(id: string, patch: Partial<ProductCatalogItem>): void {
    this.products.update((products) =>
      products.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        return { ...next, status: this.resolveProductStatus(next) };
      }),
    );
  }

  /** "Nueva Categoria": agrega la categoria a los chips de busqueda (ignora duplicados). */
  addCategory(name: string): void {
    const clean = name.trim();
    if (!clean) return;
    const exists = this.productCategories().some(
      (c) => c.toLowerCase() === clean.toLowerCase(),
    );
    if (exists) return;
    this.productCategories.update((list) => [...list, clean]);
  }

  /**
   * `porAgotarse` del source: 0 unidades -> agotado, por debajo del minimo de
   * compra -> stock bajo, en otro caso disponible.
   */
  private resolveProductStatus(p: ProductCatalogItem): ProductCatalogItem['status'] {
    if (p.stock <= 0) return 'OUT_OF_STOCK';
    return p.stock <= p.minPurchase ? 'LOW_STOCK' : 'IN_STOCK';
  }

  setUserProfile(profile: UserProfile): void {
    this.userProfile.set({ ...profile });
  }

  updateStaff(id: string, patch: Partial<StaffMember>): void {
    this.staff.update((list) =>
      list.map((m) => (m.idNumber === id ? { ...m, ...patch } : m)),
    );
  }

  clearStaffActivity(id: string): void {
    this.staff.update((list) =>
      list.map((m) => (m.idNumber === id ? { ...m, activities: [] } : m)),
    );
  }

  addClient(client: Client): void {
    this.clients.update((list) => [client, ...list]);
  }

  updateClient(id: string, patch: Partial<Client>): void {
    this.clients.update((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  addSupplier(supplier: Supplier): void {
    this.suppliers.update((list) => [supplier, ...list]);
  }

  updateSupplier(id: string, patch: Partial<Supplier>): void {
    this.suppliers.update((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  addPurchaseOrder(order: PurchaseOrder): void {
    this.purchaseOrders.update((list) => [order, ...list]);
  }

  deletePurchaseOrder(id: string): void {
    this.purchaseOrders.update((list) => list.filter((po) => po.id !== id));
  }

  updateStock(id: string, newStock: number): void {
    this.products.update((products) =>
      products.map((p) =>
        p.id === id
          ? { ...p, stock: newStock, status: this.resolveProductStatus({ ...p, stock: newStock }) }
          : p,
      ),
    );
  }
}
