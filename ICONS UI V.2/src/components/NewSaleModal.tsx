import React, { useState } from 'react';
import { SaleRecord, Transaction } from '../types';
import { X, TrendingUp, DollarSign, User, Package, CheckCircle2 } from 'lucide-react';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSale: (sale: SaleRecord, tx: Transaction) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onAddSale
}) => {
  const [client, setClient] = useState('');
  const [product, setProduct] = useState('Cups 6oz');
  const [quantity, setQuantity] = useState(2);
  const [unitPrice, setUnitPrice] = useState(1500);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const total = quantity * unitPrice;
    const saleId = `#0${Math.floor(Math.random() * 80) + 25}`;
    const txId = `#VT-${Math.floor(Math.random() * 8000) + 2000}`;

    const newSale: SaleRecord = {
      id: saleId,
      client,
      product,
      quantity,
      total,
      date: new Date().toISOString().split('T')[0],
      status: 'Completado'
    };

    const newTx: Transaction = {
      id: txId,
      module: 'Ventas',
      description: `Venta - ${product} (${quantity} unidades)`,
      status: 'Completado',
      amount: `$${total.toLocaleString()}.00`,
      date: new Date().toLocaleDateString('es-ES'),
      client
    };

    onAddSale(newSale, newTx);
    setClient('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Registrar Nueva Venta</h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Cliente</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nombre del cliente"
                className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Producto</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <option value="Cups 6oz">Cups 6oz</option>
              <option value="Cups 8oz">Cups 8oz</option>
              <option value="P/B 1 LIBRA">P/B 1 LIBRA</option>
              <option value="P/B 2 LIBRAS">P/B 2 LIBRAS</option>
              <option value="PQTE PITILLO">PQTE PITILLO</option>
              <option value="BAGS XL">BAGS XL</option>
              <option value="Napkin Pack">Napkin Pack</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Cantidad</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-primary)]">Precio Unitario ($)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-semibold">Total a Cobrar:</span>
            <span className="font-mono font-black text-cyan-500 text-base">
              ${(quantity * unitPrice).toLocaleString()}
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Venta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
