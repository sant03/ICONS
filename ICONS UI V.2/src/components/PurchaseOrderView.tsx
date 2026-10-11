import React, { useState } from 'react';
import { ViewMode } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Search, 
  Filter, 
  FileCheck,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';

interface OrderLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrderViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const PurchaseOrderView: React.FC<PurchaseOrderViewProps> = ({ onNavigate }) => {
  const [supplier, setSupplier] = useState('Global Logistics S.A.');
  const [orderNumber, setOrderNumber] = useState('PO-003');
  const [creationDate, setCreationDate] = useState('2022-02-15');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [department, setDepartment] = useState('Operations');

  // Selectable Products from Catalog
  const [availableProducts, setAvailableProducts] = useState([
    { id: '1', name: 'P/B 1 LIBRA', stockText: 'ONLY 3 LEFT', stock: 3, price: 350 },
    { id: '2', name: 'P/B 2 LIBRAS', stockText: 'STOCK: 7', stock: 7, price: 500 },
    { id: '3', name: 'P/B 3 LIBRAS', stockText: 'OUT OF STOCK', stock: 0, price: 650 },
    { id: '4', name: 'PQTE PITILLO', stockText: 'STOCK: 13', stock: 13, price: 700 },
    { id: '5', name: 'BAGS XL', stockText: 'STOCK: 25', stock: 25, price: 900 },
  ]);

  // Items added to the PO
  const [lineItems, setLineItems] = useState<OrderLineItem[]>([
    { id: 'l1', description: 'P/B 1 Libra', quantity: 5, unitPrice: 350 },
    { id: 'l2', description: 'Pqte Pitillo', quantity: 3, unitPrice: 700 },
    { id: 'l3', description: 'P/B Hielo Azul', quantity: 6, unitPrice: 1200 },
    { id: 'l4', description: 'P/B Boli Corto', quantity: 10, unitPrice: 900 },
  ]);

  const handleAddProductToPO = (prod: typeof availableProducts[0]) => {
    const existing = lineItems.find(item => item.description === prod.name);
    if (existing) {
      setLineItems(lineItems.map(item => 
        item.description === prod.name ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setLineItems([...lineItems, {
        id: Date.now().toString(),
        description: prod.name,
        quantity: 1,
        unitPrice: prod.price
      }]);
    }
  };

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setLineItems(lineItems.filter(i => i.id !== id));
    } else {
      setLineItems(lineItems.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(lineItems.filter(i => i.id !== id));
  };

  const totalEstimate = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-200 pb-20">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-cyan-500 hover:underline flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO ORDERS</span>
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Purchase Order
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Draft and authorize new supplier supply chains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold border border-[var(--border-color)] flex items-center gap-2 transition-all cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>Schedule Order</span>
          </button>

          <button
            onClick={() => alert(`Purchase Order ${orderNumber} created successfully for ${supplier}!`)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* ORDER INFORMATION DETAILS */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-color)] pb-3">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>ORDER INFORMATION DETAILS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              # ORDER NUMBER
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              CURRENT STATUS
            </label>
            <select className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-cyan-500 border border-[var(--border-color)] font-semibold">
              <option value="Draft">Draft (Editing)</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              CREATION DATE
            </label>
            <input
              type="date"
              value={creationDate}
              onChange={(e) => setCreationDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              SUPPLIER
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <option value="Global Logistics S.A.">Global Logistics S.A.</option>
              <option value="Plásticos del Norte Ltda">Plásticos del Norte Ltda</option>
              <option value="Empaques Especiales">Empaques Especiales</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              PREPARED BY
            </label>
            <input
              type="text"
              defaultValue="Sr. Freddy Potes"
              readOnly
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              AREA / DEPARTMENT
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              PAYMENT METHOD
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Net 30 Days">Net 30 Days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">
              RECEPTION DATE
            </label>
            <input
              type="date"
              defaultValue="2022-02-28"
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] font-mono"
            />
          </div>
        </div>
      </div>

      {/* SELECT PRODUCTS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Select Products</h2>
            <p className="text-xs text-[var(--text-muted)]">INVENTORY CATALOG SEARCH</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select className="px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option>Category</option>
            </select>
            <input
              type="text"
              placeholder="Code / SKU"
              className="px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] w-32"
            />
            <select className="px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <option>Stock Status</option>
            </select>
            <button className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)]">
              <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Catalog Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {availableProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => handleAddProductToPO(p)}
              className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-cyan-500 transition-all cursor-pointer text-center space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-muted)] group-hover:text-cyan-500 mx-auto flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs text-[var(--text-primary)] truncate">{p.name}</p>
              <span
                className={`inline-block px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${
                  p.stock === 0
                    ? 'bg-rose-500/10 text-rose-500'
                    : p.stock < 5
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {p.stockText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ORDER LIST TABLE (#PO-003) */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Order List: #{orderNumber}</h3>
            <p className="text-xs text-[var(--text-muted)] font-mono">DATE: {creationDate}</p>
          </div>
          <button
            onClick={() => alert("Selection finalized and locked.")}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-cyan-500" />
            <span>Finalize Selection</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-4">PRODUCT DESCRIPTION</th>
                <th className="py-3 px-4 text-center">QUANTITY TO ORDER</th>
                <th className="py-3 px-4 text-right">UNIT PRICE</th>
                <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs">
              {lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan-500" />
                    <span>{item.description}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 py-1 px-2 text-center text-xs font-mono font-bold rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 text-[var(--text-primary)]"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[var(--text-secondary)]">
                    ${item.unitPrice}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                    ${item.quantity * item.unitPrice}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Summary Footer */}
        <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-[var(--text-muted)] space-y-1">
            <p className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>SYSTEM: SUPPLY CHAIN SYNC ACTIVE</span>
            </p>
            <p>INVENTORY: REAL-TIME DELTA TRACKED</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
              Total Order Estimate:
            </span>
            <span className="text-2xl font-black font-mono text-cyan-500">
              ${totalEstimate.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
