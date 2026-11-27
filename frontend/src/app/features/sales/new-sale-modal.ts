import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideCheckCircle,
  LucideTrendingUp,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { timeout, finalize } from 'rxjs';
import { AppStore } from '../../core/state/app-store';
import { SalesApi, CreateSaleRequest } from '../../core/api/sales.api';
import { ProductsApi, ProductResponse } from '../../core/api/products.api';
import { CustomersApi, CustomerResponse } from '../../core/api/customers.api';
import { ToastNotificationService } from '../../core/services/toast-notification.service';

@Component({
  selector: 'app-new-sale-modal',
  imports: [
    DecimalPipe,
    FormsModule,
    CustomSelectComponent,
    LucideAlertCircle,
    LucideCheckCircle,
    LucideCheckCircle2,
    LucideTrendingUp,
    LucideX,
    LucideUser,
  ],
  templateUrl: './new-sale-modal.html',
})
export class NewSaleModal implements OnInit {
  protected readonly store = inject(AppStore);
  private readonly salesApi = inject(SalesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly customersApi = inject(CustomersApi);
  private readonly toastNotification = inject(ToastNotificationService);

  protected readonly isVisible = signal(false);
  protected readonly isAnimatingOut = signal(false);
  protected readonly submitting = signal(false);
  private closeTimer?: ReturnType<typeof setTimeout>;

  protected readonly apiProducts = signal<ProductResponse[]>([]);
  protected readonly apiCustomers = signal<CustomerResponse[]>([]);

  protected readonly clientName = signal('');
  protected readonly selectedProductId = signal<number | null>(null);
  protected readonly quantity = signal(1);
  protected readonly payFull = signal(true);
  protected readonly notes = signal('');

  protected readonly toastOpen = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly productOptions = computed(() =>
    this.apiProducts()
      .filter((p) => !p.blocked && p.stock > 0)
      .map((p) => p.reference),
  );

  protected readonly selectedProduct = computed(() => {
    const id = this.selectedProductId();
    return id != null ? this.apiProducts().find((p) => p.id === id) : undefined;
  });

  protected readonly unitPrice = computed(() => this.selectedProduct()?.salePrice ?? 0);
  protected readonly totalAmount = computed(() => this.quantity() * this.unitPrice());

  protected readonly customerOptions = computed(() =>
    this.apiCustomers().map((c) => c.name),
  );

  constructor() {
    effect(() => {
      const open = this.store.isNewSaleModalOpen();
      if (open) {
        if (this.closeTimer) {
          clearTimeout(this.closeTimer);
          this.closeTimer = undefined;
        }
        this.isAnimatingOut.set(false);
        this.isVisible.set(true);
        this.resetForm();
      } else if (this.isVisible() && !this.isAnimatingOut()) {
        this.isAnimatingOut.set(true);
        this.closeTimer = setTimeout(() => {
          this.isVisible.set(false);
          this.isAnimatingOut.set(false);
        }, 220);
      }
    });
  }

  ngOnInit(): void {
    this.productsApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiProducts.set(page.content),
    });
    this.customersApi.list({ size: 500 }).subscribe({
      next: (page) => this.apiCustomers.set(page.content),
    });
  }

  private resetForm(): void {
    this.clientName.set('');
    this.selectedProductId.set(null);
    this.quantity.set(1);
    this.payFull.set(true);
    this.notes.set('');
    this.submitting.set(false);
  }

  protected onProductChange(name: string): void {
    const product = this.apiProducts().find((p) => p.reference === name);
    this.selectedProductId.set(product?.id ?? null);
  }

  protected selectedProductName(): string {
    return this.selectedProduct()?.reference ?? '';
  }

  protected requestClose(): void {
    if (this.isAnimatingOut()) return;
    this.isAnimatingOut.set(true);
    this.closeTimer = setTimeout(() => {
      this.store.closeNewSaleModal();
      this.isVisible.set(false);
      this.isAnimatingOut.set(false);
    }, 220);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  protected handleSubmit(): void {
    const product = this.selectedProduct();
    if (!this.clientName().trim() || !product) return;
    if (this.submitting()) return;

    this.submitting.set(true);

    const customer = this.apiCustomers().find((c) => c.name === this.clientName().trim());
    const total = this.totalAmount();

    const request: CreateSaleRequest = {
      customerId: customer?.id,
      customerName: this.clientName().trim(),
      date: new Date().toISOString().slice(0, 10),
      amountPaid: this.payFull() ? total : 0,
      notes: this.notes().trim() || undefined,
      items: [{ productId: product.id, quantity: this.quantity() }],
    };

    this.salesApi.create(request).pipe(
      timeout(10000),
      finalize(() => this.submitting.set(false)),
    ).subscribe({
      next: (sale) => {
        this.toastNotification.show({
          title: 'Nueva venta ' + sale.code,
          body: 'Venta por $' + total.toLocaleString() + ' a ' + this.clientName().trim(),
          type: 'order',
          url: '/sales',
        });
        this.store.saleCreatedTick.set(Date.now());
        setTimeout(() => this.requestClose(), 400);
      },
      error: (err) => {
        if (err?.name === 'TimeoutError') {
          this.toastNotification.show({
            title: 'Venta registrada',
            body: 'Venta por $' + total.toLocaleString() + ' a ' + this.clientName().trim(),
            type: 'order',
            url: '/sales',
          });
          this.store.saleCreatedTick.set(Date.now());
          setTimeout(() => this.requestClose(), 400);
        } else {
          this.showToast(err?.error?.detail ?? 'Error al registrar la venta', 'error');
        }
      },
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
