import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAlertCircle,
  LucideArrowLeft,
  LucideCheckCircle,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideFileCheck,
  LucideFilter,
  LucideGripVertical,
  LucideGrid,
  LucidePackage,
  LucideSearch,
  LucideSparkles,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import { CustomDatePickerComponent } from '../../shared/ui/custom-datepicker/custom-datepicker';
import { ScheduleOrderDrawer } from '../../shared/ui/schedule-order-drawer/schedule-order-drawer';
import { SwipeDismissDirective } from '../../shared/directives/swipe-dismiss.directive';
import { AppStore } from '../../core/state/app-store';
import { PurchaseOrdersApi, CreatePurchaseOrderRequest } from '../../core/api/purchase-orders.api';
import { SuppliersApi, SupplierResponse } from '../../core/api/suppliers.api';
import { ProductsApi } from '../../core/api/products.api';

interface OrderLineItem {
  id: string;
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  stockText: string;
  stock: number;
  price: number;
}

@Component({
  selector: 'app-purchase-order-view',
  imports: [
    FormsModule,
    CustomSelectComponent,
    CustomDatePickerComponent,
    ScheduleOrderDrawer,
    SwipeDismissDirective,
    LucideAlertCircle,
    LucideArrowLeft,
    LucideCheckCircle,
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideFileCheck,
    LucideFilter,
    LucideGripVertical,
    LucideGrid,
    LucidePackage,
    LucideSearch,
    LucideSparkles,
    LucideTrash2,
    LucideX,
  ],
  templateUrl: './purchase-order-view.html',
})
export class PurchaseOrderView implements OnInit, AfterViewInit {
  protected readonly store = inject(AppStore);
  private readonly api = inject(PurchaseOrdersApi);
  private readonly suppliersApi = inject(SuppliersApi);
  private readonly productsApi = inject(ProductsApi);

  private readonly apiSuppliers = signal<SupplierResponse[]>([]);
  protected readonly supplierOptions = computed(() => this.apiSuppliers().map((s) => s.name));
  protected readonly allProducts = signal<CatalogProduct[]>([]);
  protected readonly isLoadingProducts = signal(true);

  protected readonly poSearch = signal('');
  protected readonly poCategory = signal('');
  protected readonly poStockStatus = signal('');

  protected readonly categoryOptions = computed(() => {
    const cats = [...new Set(this.allProducts().map((p) => p.category))].filter(Boolean).sort();
    return ['Todas', ...cats];
  });
  protected readonly stockStatusOptions = ['Todos', 'En Stock', 'Stock Bajo', 'Agotado'];

  protected readonly availableProducts = computed(() => {
    let products = this.allProducts();
    const search = this.poSearch().trim().toLowerCase();
    if (search) {
      products = products.filter(
        (p) => p.name.toLowerCase().includes(search) || p.code.toLowerCase().includes(search),
      );
    }
    const cat = this.poCategory();
    if (cat && cat !== 'Todas') {
      products = products.filter((p) => p.category === cat);
    }
    const status = this.poStockStatus();
    if (status && status !== 'Todos') {
      if (status === 'En Stock') products = products.filter((p) => p.stock >= 5);
      else if (status === 'Stock Bajo') products = products.filter((p) => p.stock > 0 && p.stock < 5);
      else if (status === 'Agotado') products = products.filter((p) => p.stock === 0);
    }
    return products;
  });

  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.poSearch().trim()) count++;
    if (this.poCategory() && this.poCategory() !== 'Todas') count++;
    if (this.poStockStatus() && this.poStockStatus() !== 'Todos') count++;
    return count;
  });

  protected readonly supplier = signal('');
  protected readonly creationDate = signal(new Date().toISOString().slice(0, 10));
  protected readonly receptionDate = signal('');
  protected readonly madeBy = signal('');
  protected readonly department = signal('');
  protected readonly departmentOptions = ['Operaciones', 'Logística', 'Ventas', 'Administración'];
  protected readonly paymentMethod = signal('');
  protected readonly paymentMethodOptions = ['Transferencia', 'Efectivo', 'Crédito 30 días'];

  protected readonly selectedSupplier = computed(() => {
    const name = this.supplier();
    return this.apiSuppliers().find((s) => s.name === name) ?? null;
  });

  protected readonly productsContainer = viewChild<ElementRef<HTMLDivElement>>('productsContainer');
  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(true);

  protected readonly isAllProductsDrawerOpen = signal(false);
  protected readonly isAllProductsDrawerReady = signal(false);

  protected readonly isDragging = signal(false);
  protected readonly isOverDropZone = signal(false);
  protected readonly justDropped = signal(false);
  private draggedProduct: CatalogProduct | null = null;

  protected readonly lineItems = signal<OrderLineItem[]>([]);

  protected readonly totalEstimate = computed(() =>
    this.lineItems().reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
  );

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.suppliersApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiSuppliers.set(page.content),
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al cargar proveedores', 'error'),
    });
    this.productsApi.list({ size: 500 }).subscribe({
      next: (page) => {
        this.allProducts.set(
          page.content.filter((p) => !p.blocked).map((p) => ({
            id: String(p.id),
            code: p.code,
            name: p.reference,
            category: p.categoryName,
            stockText: p.stock === 0 ? 'AGOTADO' : p.stock <= p.minPurchase ? `SOLO ${p.stock}` : `STOCK: ${p.stock}`,
            stock: p.stock,
            price: p.purchasePrice,
          })),
        );
        this.isLoadingProducts.set(false);
      },
      error: (err) => {
        this.isLoadingProducts.set(false);
        this.showToast(err?.error?.detail ?? 'Error al cargar productos', 'error');
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScroll(), 100);
  }

  protected checkScroll(): void {
    const el = this.productsContainer()?.nativeElement;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    this.canScrollLeft.set(scrollLeft > 10);
    this.canScrollRight.set(scrollLeft < scrollWidth - clientWidth - 10);
  }

  protected scrollProducts(direction: 'left' | 'right'): void {
    const el = this.productsContainer()?.nativeElement;
    if (!el) return;
    el.scrollBy({
      left: direction === 'right' ? 240 : -240,
      behavior: 'smooth',
    });
    setTimeout(() => this.checkScroll(), 350);
  }

  protected openAllProductsDrawer(): void {
    this.isAllProductsDrawerReady.set(true);
    this.isAllProductsDrawerOpen.set(true);
  }

  protected closeAllProductsDrawer(): void {
    this.isAllProductsDrawerOpen.set(false);
  }

  protected clearFilters(): void {
    this.poSearch.set('');
    this.poCategory.set('');
    this.poStockStatus.set('');
  }

  protected onDragStart(event: DragEvent, product: CatalogProduct): void {
    this.draggedProduct = product;
    this.isDragging.set(true);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', product.id);
      const el = event.target as HTMLElement;
      const ghost = el.cloneNode(true) as HTMLElement;
      ghost.style.width = `${el.offsetWidth}px`;
      ghost.style.opacity = '0.9';
      ghost.style.transform = 'rotate(3deg) scale(1.05)';
      ghost.style.borderColor = 'rgb(6, 182, 212)';
      ghost.style.boxShadow = '0 20px 40px rgba(6, 182, 212, 0.3)';
      document.body.appendChild(ghost);
      event.dataTransfer.setDragImage(ghost, el.offsetWidth / 2, el.offsetHeight / 2);
      requestAnimationFrame(() => document.body.removeChild(ghost));
    }
  }

  protected onDragEnd(): void {
    this.isDragging.set(false);
    this.isOverDropZone.set(false);
    this.draggedProduct = null;
  }

  protected onDropZoneDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.isOverDropZone.set(true);
  }

  protected onDropZoneDragLeave(event: DragEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      this.isOverDropZone.set(false);
    }
  }

  protected onDropZoneDrop(event: DragEvent): void {
    event.preventDefault();
    this.isOverDropZone.set(false);
    if (this.draggedProduct) {
      this.addProductToPO(this.draggedProduct);
      this.justDropped.set(true);
      setTimeout(() => this.justDropped.set(false), 600);
    }
    this.draggedProduct = null;
    this.isDragging.set(false);
  }

  protected addProductToPO(prod: CatalogProduct): void {
    const prodId = parseInt(prod.id, 10);
    this.lineItems.update((items) => {
      const existing = items.find((item) => item.productId === prodId);
      if (existing) {
        return items.map((item) =>
          item.productId === prodId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...items,
        { id: Date.now().toString(), productId: prodId, description: prod.name, quantity: 1, unitPrice: prod.price },
      ];
    });
  }

  protected changeQuantity(id: string, newQty: number): void {
    this.lineItems.update((items) =>
      newQty <= 0
        ? items.filter((i) => i.id !== id)
        : items.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
    );
  }

  protected removeItem(id: string): void {
    this.lineItems.update((items) => items.filter((i) => i.id !== id));
  }

  protected createOrder(): void {
    const supplierObj = this.selectedSupplier();
    if (!supplierObj) {
      this.showToast('Selecciona un proveedor', 'error');
      return;
    }
    if (this.lineItems().length === 0) {
      this.showToast('Agrega al menos un producto a la orden', 'error');
      return;
    }
    if (!this.madeBy().trim()) {
      this.showToast('El campo "Elaborado por" es obligatorio', 'error');
      return;
    }

    const request: CreatePurchaseOrderRequest = {
      supplierId: supplierObj.id,
      supplierName: supplierObj.name,
      supplierAddress: supplierObj.address,
      supplierPhone: supplierObj.phone,
      supplierEmail: supplierObj.email,
      date: this.creationDate(),
      madeOn: this.creationDate(),
      receptionDate: this.receptionDate() || undefined,
      madeBy: this.madeBy().trim(),
      area: this.department() || undefined,
      paymentMethod: this.paymentMethod() || undefined,
      items: this.lineItems().map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    this.api.create(request).subscribe({
      next: () => {
        this.showToast('Orden de compra creada exitosamente', 'success');
        setTimeout(() => this.store.navigate('purchase-orders'), 500);
      },
      error: (err) => this.showToast(err?.error?.detail ?? 'Error al crear la orden', 'error'),
    });
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

  protected openScheduleDrawer(): void {
    this.store.openScheduleDrawer({
      supplier: this.supplier() || 'Global Logistics S.A.',
      orderNumber: 'Nueva',
      paymentMethod: this.paymentMethod() || 'Transferencia',
      itemsCount: this.lineItems().length,
      estimatedTotal: this.totalEstimate(),
    });
  }
}
