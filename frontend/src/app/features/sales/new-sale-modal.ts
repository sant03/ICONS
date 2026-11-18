import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../shared/ui/custom-select/custom-select';
import {
  LucideCheckCircle2,
  LucideTrendingUp,
  LucideUser,
  LucideX,
} from '@lucide/angular';
import { SaleRecord, Transaction } from '../../core/models/types';
import { AppStore } from '../../core/state/app-store';

@Component({
  selector: 'app-new-sale-modal',
  imports: [
    FormsModule,
    CustomSelectComponent,
    LucideTrendingUp,
    LucideX,
    LucideUser,
    LucideCheckCircle2,
  ],
  templateUrl: './new-sale-modal.html',
})
export class NewSaleModal {
  protected readonly store = inject(AppStore);

  protected readonly isVisible = signal(false);
  protected readonly isAnimatingOut = signal(false);
  private closeTimer?: ReturnType<typeof setTimeout>;

  protected readonly client = signal('');
  protected readonly product = signal('Cups 6oz');
  protected readonly productOptions = [
    'Cups 6oz',
    'Cups 8oz',
    'P/B 1 LIBRA',
    'P/B 2 LIBRAS',
    'PQTE PITILLO',
    'BAGS XL',
    'Napkin Pack',
  ];
  protected readonly quantity = signal(2);
  protected readonly unitPrice = signal(1500);

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
      } else if (this.isVisible() && !this.isAnimatingOut()) {
        this.isAnimatingOut.set(true);
        this.closeTimer = setTimeout(() => {
          this.isVisible.set(false);
          this.isAnimatingOut.set(false);
        }, 220);
      }
    });
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
    if (!this.client()) return;

    const total = this.quantity() * this.unitPrice();
    const saleId = `#0${Math.floor(Math.random() * 80) + 25}`;
    const txId = `#VT-${Math.floor(Math.random() * 8000) + 2000}`;

    const newSale: SaleRecord = {
      id: saleId,
      code: saleId,
      client: this.client(),
      product: this.product(),
      quantity: this.quantity(),
      unitPrice: this.unitPrice(),
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'Completado',
      paymentStatus: 'Pagado',
    };

    const newTx: Transaction = {
      id: txId,
      module: 'Ventas',
      description: `Venta - ${this.product()} (${this.quantity()} unidades)`,
      status: 'Completado',
      amount: `$${total.toLocaleString()}.00`,
      date: new Date().toLocaleDateString('es-ES'),
      client: this.client(),
    };

    this.store.addSale(newSale, newTx);
    this.client.set('');
    this.requestClose();
  }
}
