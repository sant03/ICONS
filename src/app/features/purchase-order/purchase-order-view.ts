import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideClock,
  LucideFileCheck,
  LucideFilter,
  LucidePackage,
  LucideSparkles,
  LucideTrash2,
} from '@lucide/angular';
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
    LucideArrowLeft,
    LucideClock,
    LucideFileCheck,
    LucideSparkles,
    LucidePackage,
    LucideFilter,
    LucideCheck,
    LucideTrash2,
  ],
  templateUrl: './purchase-order-view.html',
})
export class PurchaseOrderView {
  protected readonly store = inject(AppStore);

  protected readonly supplier = signal('Global Logistics S.A.');
  protected readonly orderNumber = signal('PO-003');
  protected readonly creationDate = signal('2022-02-15');
  protected readonly paymentMethod = signal('Bank Transfer');
  protected readonly department = signal('Operations');

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
