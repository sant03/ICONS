import React from 'react';
import { ViewMode, ThemeMode } from '../types';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  LayoutGrid, 
  LogOut, 
  User, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSearchOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
}) => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left side: Brand or Welcome text */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded-[10px] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-[var(--text-primary)]">
                Sistema de Control
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span>Bienvenido, Sr. Freddy Potes</span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-500"></span>
              <span>10:30 am - 15 de febrero</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por SKU, Cliente, Transacción o Pedido... (ALT+F)"
            className="w-full pl-9 pr-12 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-[var(--text-muted)]"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-primary)] rounded border border-[var(--border-color)]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Actions, Theme toggle & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sistema En Línea</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-all cursor-pointer relative group"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-700" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notification Bell */}
        <button className="p-2 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] transition-all relative cursor-pointer">
          <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-[var(--bg-secondary)] animate-pulse"></span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-2 pr-2 py-1 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-color)]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-cyan-500/20">
              FP
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">Freddy60</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[var(--border-color)]">
                <p className="text-xs font-semibold text-[var(--text-primary)]">Freddy Potes</p>
                <p className="text-[11px] text-[var(--text-muted)]">freddy@plastyfreddy.com</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('users');
                }}
                className="w-full text-left px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-cyan-500" />
                <span>Perfil de Usuario (Angelly)</span>
              </button>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('welcome');
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
