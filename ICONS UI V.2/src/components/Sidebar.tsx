import React from 'react';
import { ViewMode } from '../types';
import { 
  Home, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Building2, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard' as ViewMode, label: 'Inicio', icon: Home },
    { id: 'users' as ViewMode, label: 'Usuarios', icon: Users, badge: '1' },
    { id: 'sales' as ViewMode, label: 'Ventas', icon: TrendingUp },
    { id: 'orders' as ViewMode, label: 'Pedidos / Ventas', icon: ShoppingBag, badge: '8' },
    { id: 'products' as ViewMode, label: 'Productos', icon: Package },
    { id: 'purchase-order' as ViewMode, label: 'Orden de Compra', icon: FileText, highlight: true },
    { id: 'settings' as ViewMode, label: 'Ajustes', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between p-4 shrink-0 transition-colors duration-200 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Module section title */}
        <div className="px-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Módulos del Sistema
          </p>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick status box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-transparent border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-500 text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Infraestructura Sync</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            v2.4.0 — Base de datos sincronizada en tiempo real (AES-256).
          </p>
        </div>
      </div>

      {/* Footer logout button */}
      <div className="pt-4 border-t border-[var(--border-color)]">
        <button
          onClick={() => onNavigate('welcome')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir / Cambiar Cuenta</span>
        </button>
      </div>
    </aside>
  );
};
