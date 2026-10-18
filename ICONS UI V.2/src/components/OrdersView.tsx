import React, { useState } from 'react';
import { OrderItem } from '../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  User, 
  Calendar, 
  Box, 
  X, 
  CheckCircle2, 
  Clock, 
  Truck,
  Database
} from 'lucide-react';

interface OrdersViewProps {
  orders: OrderItem[];
  onAddOrder: (newOrder: OrderItem) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onAddOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form state
  const [clientName, setClientName] = useState('');
  const [units, setUnits] = useState(10);
  const [status, setStatus] = useState<'COMPLETED' | 'PENDING' | 'SHIPPED'>('PENDING');

  const filteredOrders = orders.filter(
    o => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
         o.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;
    const newOrd: OrderItem = {
      id: Date.now().toString(),
      orderNumber: `Pedido ${orders.length + 1}`,
      status,
      client: clientName,
      date: new Date().toLocaleDateString('es-ES'),
      units,
      totalAmount: units * 400
    };
    onAddOrder(newOrd);
    setClientName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-200 relative pb-24">
      {/* Breadcrumb & Title Header */}
      <div className="space-y-1 border-b border-[var(--border-color)] pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          <span>VENTAS</span>
          <span>&gt;</span>
          <span className="text-cyan-500">PEDIDOS</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Ventas / Pedidos
            </h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              <span>Registro de Pedidos — Infrastructure Database</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYSTEM SYNCHRONIZED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Filter and Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Todos los Pedidos</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-mono font-semibold">
            {orders.length} Active
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or Client..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-cyan-500 transition-colors cursor-pointer">
            <ArrowUpDown className="w-4 h-4 text-[var(--text-muted)]" />
          </button>

          <button className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-cyan-500 transition-colors cursor-pointer">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Order Cards Grid matching PDF pages 16 & 18 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredOrders.map((order) => {
          const isCompleted = order.status === 'COMPLETED';
          const isPending = order.status === 'PENDING';
          const isShipped = order.status === 'SHIPPED';

          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-cyan-500 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center space-y-4 group"
            >
              {/* Box Icon Graphic */}
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-cyan-500 group-hover:border-cyan-500/30 transition-all">
                <Box className="w-8 h-8" />
              </div>

              {/* Title & Status Badge */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{order.orderNumber}</h3>
                <span
                  className={`inline-block px-3 py-0.5 text-[10px] font-mono font-extrabold uppercase rounded-full ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : isPending
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Info Fields */}
              <div className="w-full pt-3 border-t border-[var(--border-color)] space-y-2 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">CLIENT</span>
                  <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-500" />
                    {order.client}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">DATE</span>
                  <span className="font-mono text-[var(--text-secondary)] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                    {order.date}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">RESOURCES</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {order.units} Units
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Status Indicators */}
      <div className="flex items-center gap-6 text-[10px] font-mono text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>ORDERS: DATABASE LIVE</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>ALERTS: 0 ISSUES</span>
        </span>
      </div>

      {/* Floating Action (+) Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-2xl shadow-cyan-500/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer z-40 border-2 border-white/20"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal for creating new Order */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Nuevo Pedido</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-primary)]">Nombre del Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Maria Gutierrez"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Cantidad / Unidades</label>
                  <input
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-primary)]">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Estado:</span>
                <span className="font-bold text-cyan-500 font-mono">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Cliente:</span>
                <span className="font-semibold text-[var(--text-primary)]">{selectedOrder.client}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Fecha de Registro:</span>
                <span className="font-mono text-[var(--text-primary)]">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-muted)]">Unidades Solicitadas:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedOrder.units} Unidades</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Monto Estimado:</span>
                <span className="font-mono font-black text-cyan-500 text-sm">
                  ${selectedOrder.totalAmount || selectedOrder.units * 400}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
