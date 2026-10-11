import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, LucideTrendingUp, LucideX, LucideUser, LucideCheckCircle2],
  templateUrl: './new-sale-modal.html',
})
export class NewSaleModal {
  protected readonly store = inject(AppStore);

  protected readonly client = signal('');
  protected readonly product = signal('Cups 6oz');
  protected readonly quantity = signal(2);
  protected readonly unitPrice = signal(1500);

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
    this.store.closeNewSaleModal();
  }
}
