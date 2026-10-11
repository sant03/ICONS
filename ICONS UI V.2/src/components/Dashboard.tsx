import React, { useState } from 'react';
import { ViewMode, Transaction } from '../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  PlusCircle, 
  Search, 
  Box, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Download, 
  Filter, 
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewMode) => void;
  transactions: Transaction[];
  onNewSaleClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  transactions,
  onNewSaleClick
}) => {
  const [filterModule, setFilterModule] = useState<string>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterModule === 'all') return true;
    return t.module.toLowerCase() === filterModule.toLowerCase();
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Panel de Control General
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              Inventario Activo
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Vista general de sus operaciones y acceso rápido a los módulos principales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,ID,Modulo,Descripcion,Estado,Monto\n" 
                + transactions.map(t => `${t.id},${t.module},"${t.description}",${t.status},${t.amount}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "reporte_general.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border-color)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Exportar Reporte</span>
          </button>

          <button
            onClick={onNewSaleClick}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-cyan-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              VENTAS DE HOY
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">$12,450.00</p>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+12.5% vs ayer</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-amber-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              STOCK CRÍTICO / BAJO
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">18 Items</p>
            <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-2 vs ayer (requiere reposición)</span>
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-indigo-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              PEDIDOS PENDIENTES
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">5</p>
            <p className="text-[11px] text-cyan-500 font-semibold flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nuevos vs ayer</span>
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm hover:border-emerald-500/30 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              NUEVOS CLIENTES
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">24</p>
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18% este mes</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3 Main Quick Action Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ventas */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between hover:border-cyan-500/50 transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Ventas</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Gestión completa de facturación y despacho diario.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Registrar Ventas diarias</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Consultar historial de Ventas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Editar Ventas realizadas</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>Generar reportes de ingresos</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <span>Gestionar Ventas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Compras */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between hover:border-pink-500/50 transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Compras</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Órdenes de suministro e ingreso de proveedores.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Registrar Compras a proveedores</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Consultar historial de Compras</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Editar Registros de entrada</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>Ingresar nuevos Productos</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate('purchase-order')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
          >
            <span>Gestionar Compras</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Productos */}
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Productos</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Catálogo de mercancía, existencias y SKUs.
              </p>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Consultar estado de los productos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Añadir y editar información</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Ajustar niveles de inventario</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Categorizar catálogo</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <span>Ver Productos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Pills (matching reference bottom buttons) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onNewSaleClick}
          className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500 text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span>Nuevo Registro</span>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded">ALT + N</kbd>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500 text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-cyan-500" />
          <span>Buscar SKU</span>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded">ALT + F</kbd>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-cyan-500 text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Box className="w-3.5 h-3.5 text-cyan-500" />
          <span>Inventario Rápido</span>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded">ALT + I</kbd>
        </button>
      </div>

      {/* Actividad Reciente Table */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Actividad Reciente</h3>
            <p className="text-xs text-[var(--text-muted)]">Historial de últimas transacciones en el sistema</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-medium">
              <button
                onClick={() => setFilterModule('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterModule === 'all' ? 'bg-cyan-500 text-white font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterModule('ventas')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterModule === 'ventas' ? 'bg-cyan-500 text-white font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Ventas
              </button>
              <button
                onClick={() => setFilterModule('compras')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterModule === 'compras' ? 'bg-cyan-500 text-white font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Compras
              </button>
            </div>

            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-cyan-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Todo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-4">ID Transacción</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-[var(--border-color)] divide-[var(--border-color)] text-xs">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-cyan-500">{tx.id}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      tx.module === 'Ventas'
                        ? 'bg-cyan-500/10 text-cyan-500'
                        : tx.module === 'Compras'
                        ? 'bg-pink-500/10 text-pink-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {tx.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-primary)] font-medium">{tx.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      {tx.status === 'Completado' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="text-emerald-500">Completado</span>
                        </>
                      )}
                      {tx.status === 'En Proceso' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                          <span className="text-cyan-500">En Proceso</span>
                        </>
                      )}
                      {tx.status === 'Verificado' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          <span className="text-indigo-500">Verificado</span>
                        </>
                      )}
                      {tx.status === 'Pendiente' && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="text-amber-500">Pendiente</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                    {tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
