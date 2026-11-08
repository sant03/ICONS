import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideFileCheck,
  LucideFilter,
  LucideGrid,
  LucidePackage,
  LucideSparkles,
  LucideTrash2,
  LucideX,
} from '@lucide/angular';
import { CustomSelectComponent, SelectOption } from '../../shared/ui/custom-select/custom-select';
import { CustomDatePickerComponent } from '../../shared/ui/custom-datepicker/custom-datepicker';
import { AppStore } from '../../core/state/app-store';

interface OrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CatalogProduct {
  id: string;
  name: string;
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
    LucideArrowLeft,
    LucideClock,
    LucideFileCheck,
    LucideSparkles,
    LucidePackage,
    LucideFilter,
    LucideCheck,
    LucideTrash2,
    LucideChevronLeft,
    LucideChevronRight,
    LucideGrid,
    LucideX,
  ],
  templateUrl: './purchase-order-view.html',
})
export class PurchaseOrderView implements AfterViewInit {
  protected readonly store = inject(AppStore);

  protected readonly poStatus = signal('Draft');
  protected readonly statusOptions: SelectOption[] = [
    { value: 'Draft', label: 'Draft (Editing)' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
  ];

  protected readonly supplier = signal('Global Logistics S.A.');
  protected readonly supplierOptions = [
    'Global Logistics S.A.',
    'Plásticos del Norte Ltda',
    'Empaques Especiales',
  ];

  protected readonly department = signal('Operations');
  protected readonly departmentOptions = ['Operations', 'Logistics', 'Sales'];

  protected readonly paymentMethod = signal('Bank Transfer');
  protected readonly paymentMethodOptions = [
    'Bank Transfer',
    'Credit Card',
    'Net 30 Days',
  ];

  protected readonly poCategory = signal('Category');
  protected readonly categoryOptions = ['Category', 'Plásticos', 'Empaques', 'Bolsas', 'Vasos'];

  protected readonly poStockStatus = signal('Stock Status');
  protected readonly stockStatusOptions = ['Stock Status', 'In Stock', 'Low Stock', 'Out of Stock'];

  protected readonly orderNumber = signal('PO-003');
  protected readonly creationDate = signal('2022-02-15');

  // Carousel controls for Select Products
  protected readonly productsContainer = viewChild<ElementRef<HTMLDivElement>>('productsContainer');
  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(true);

  // Bottom drawer state for "Ver todos"
  protected readonly isAllProductsDrawerOpen = signal(false);
  protected readonly isAllProductsDrawerReady = signal(false);

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
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
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

  // Selectable Products from Catalog
  protected readonly availableProducts = signal<CatalogProduct[]>([
    { id: '1', name: 'P/B 1 LIBRA', stockText: 'ONLY 3 LEFT', stock: 3, price: 350 },
    { id: '2', name: 'P/B 2 LIBRAS', stockText: 'STOCK: 7', stock: 7, price: 500 },
    { id: '3', name: 'P/B 3 LIBRAS', stockText: 'OUT OF STOCK', stock: 0, price: 650 },
    { id: '4', name: 'PQTE PITILLO', stockText: 'STOCK: 13', stock: 13, price: 700 },
    { id: '5', name: 'BAGS XL', stockText: 'STOCK: 25', stock: 25, price: 900 },
  ]);

  // Items added to the PO
  protected readonly lineItems = signal<OrderLineItem[]>([
    { id: 'l1', description: 'P/B 1 Libra', quantity: 5, unitPrice: 350 },
    { id: 'l2', description: 'Pqte Pitillo', quantity: 3, unitPrice: 700 },
    { id: 'l3', description: 'P/B Hielo Azul', quantity: 6, unitPrice: 1200 },
    { id: 'l4', description: 'P/B Boli Corto', quantity: 10, unitPrice: 900 },
  ]);

  protected readonly totalEstimate = computed(() =>
    this.lineItems().reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
  );

  protected addProductToPO(prod: CatalogProduct): void {
    this.lineItems.update((items) => {
      const existing = items.find((item) => item.description === prod.name);
      if (existing) {
        return items.map((item) =>
          item.description === prod.name ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...items,
        {
          id: Date.now().toString(),
          description: prod.name,
          quantity: 1,
          unitPrice: prod.price,
        },
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

  /** Mirrors the `alert(...)` calls of the original React component. */
  protected notify(message: string): void {
    window.alert(message);
  }
}
