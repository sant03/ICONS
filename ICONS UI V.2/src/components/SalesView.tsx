import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MoreHorizontal,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface SalesViewProps {
  todaySales: SaleRecord[];
  historicalSales: SaleRecord[];
  onNewSaleClick: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  todaySales,
  historicalSales,
  onNewSaleClick
}) => {
  const [searchTerm, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredTodaySales = todaySales.filter(s => 
    s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoricalSales = historicalSales.filter(s => 
    s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-200 relative pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Sales</h1>
          <p className="text-xs text-[var(--text-muted)]">Comprehensive record of transactions and orders.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const csv = "ID,Client,Product,Quantity,Total,Date\n" + 
                [...todaySales, ...historicalSales].map(s => `${s.id},${s.client},${s.product},${s.quantity},$${s.total},${s.date}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sales_records.csv';
              a.click();
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium border border-[var(--border-color)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onNewSaleClick}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Sale</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              TOTAL REVENUE
            </span>
            <DollarSign className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">$12,450.00</p>
          <p className="text-[10px] font-semibold text-emerald-500">+8.2% vs last month</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              TRANSACTIONS
            </span>
            <ShoppingBag className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">142</p>
          <p className="text-[10px] font-semibold text-emerald-500">+12 vs last month</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              AVG. TICKET
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">$87.60</p>
          <p className="text-[10px] font-semibold text-rose-500">-2.4% vs last month</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              ACTIVE ITEMS
            </span>
            <Tag className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">45</p>
          <p className="text-[10px] font-semibold text-[var(--text-muted)]">Stable vs last month</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Picker Button */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-cyan-500" />
            <span>September 27, 2026</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </div>

          {/* Checkboxes matching reference design */}
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-cyan-500 focus:ring-cyan-500" />
              <span>Date</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-cyan-500 focus:ring-cyan-500" />
              <span>Product</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="rounded text-cyan-500 focus:ring-cyan-500" />
              <span>Client</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="rounded text-cyan-500 focus:ring-cyan-500" />
              <span>Order</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="rounded text-cyan-500 focus:ring-cyan-500" />
              <span>Code</span>
            </label>
          </div>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search sales records..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* TODAY'S SALES SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Today, September 27, 2026</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-mono font-semibold">
              {filteredTodaySales.length} records found
            </span>
          </h2>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">CLIENT</th>
                <th className="py-3 px-4">PRODUCT</th>
                <th className="py-3 px-4 text-center">QUANTITY</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs">
              {filteredTodaySales.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-500">{item.id}</td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{item.client}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{item.product}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                    ${item.total}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded hover:bg-[var(--bg-tertiary)]">
                      <MoreHorizontal className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL HISTORICAL RECORDS SECTION */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)]">All Historical Records</h2>
          <a href="#archives" className="text-xs font-semibold text-cyan-500 hover:underline">
            View All Archives
          </a>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CLIENT</th>
                <th className="py-3 px-4">CODE</th>
                <th className="py-3 px-4">PRODUCT</th>
                <th className="py-3 px-4 text-center">QTY</th>
                <th className="py-3 px-4 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-xs">
              {filteredHistoricalSales.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">{item.date}</td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">{item.client}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)]">{item.code}</td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{item.product}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">
                    ${item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Legend at bottom */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[var(--text-muted)] uppercase">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>COMPLETED TRANSACTIONS</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>PENDING DELIVERY</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>REFUNDED / VOIDED</span>
        </span>
      </div>

      {/* Floating Action Button (+) matching PDF pages 9 & 13 */}
      <button
        onClick={onNewSaleClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white shadow-2xl shadow-cyan-500/50 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer z-40 border-2 border-white/20"
        title="Record New Sale"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
