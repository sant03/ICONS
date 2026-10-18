import React, { useState, useEffect } from 'react';
import { ViewMode, ThemeMode, Transaction, SaleRecord, OrderItem, ProductCatalogItem } from './types';
import { 
  initialTransactions, 
  todaySalesRecords, 
  historicalSalesRecords, 
  initialOrders, 
  initialProducts, 
  userAuditLogs, 
  initialUserProfile 
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeAuth } from './components/WelcomeAuth';
import { Dashboard } from './components/Dashboard';
import { SalesView } from './components/SalesView';
import { OrdersView } from './components/OrdersView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { UsersView } from './components/UsersView';
import { ProductsView } from './components/ProductsView';
import { NewSaleModal } from './components/NewSaleModal';

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  // Application Data States
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [todaySales, setTodaySales] = useState<SaleRecord[]>(todaySalesRecords);
  const [historicalSales] = useState<SaleRecord[]>(historicalSalesRecords);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [products, setProducts] = useState<ProductCatalogItem[]>(initialProducts);
  const [auditLogs] = useState(userAuditLogs);
  const [userProfile] = useState(initialUserProfile);

  // Modal State
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  // Toggle Theme class on body/root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAddSale = (newSale: SaleRecord, newTx: Transaction) => {
    setTodaySales([newSale, ...todaySales]);
    setTransactions([newTx, ...transactions]);
  };

  const handleAddOrder = (newOrder: OrderItem) => {
    setOrders([newOrder, ...orders]);
  };

  const handleAddProduct = (newProd: ProductCatalogItem) => {
    setProducts([newProd, ...products]);
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'OUT_OF_STOCK' : newStock < 10 ? 'LOW_STOCK' : 'IN_STOCK'
        };
      }
      return p;
    }));
  };

  // If user is in welcome/login/register screen (full screen view without shell)
  if (currentView === 'welcome' || currentView === 'login' || currentView === 'register') {
    return (
      <WelcomeAuth
        initialSubMode={currentView}
        onAuthenticate={() => setCurrentView('dashboard')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 ${theme}`}>
      {/* Sticky Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace with Sidebar & Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          {currentView === 'dashboard' && (
            <Dashboard
              onNavigate={setCurrentView}
              transactions={transactions}
              onNewSaleClick={() => setIsNewSaleModalOpen(true)}
            />
          )}

          {currentView === 'sales' && (
            <SalesView
              todaySales={todaySales}
              historicalSales={historicalSales}
              onNewSaleClick={() => setIsNewSaleModalOpen(true)}
            />
          )}

          {currentView === 'orders' && (
            <OrdersView
              orders={orders}
              onAddOrder={handleAddOrder}
            />
          )}

          {currentView === 'purchase-order' && (
            <PurchaseOrderView
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'users' && (
            <UsersView
              user={userProfile}
              auditLogs={auditLogs}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'products' && (
            <ProductsView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {currentView === 'settings' && (
            <div className="p-8 max-w-3xl space-y-6">
              <h1 className="text-2xl font-bold">Ajustes del Sistema</h1>
              <div className="p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] space-y-4">
                <p className="text-sm text-[var(--text-muted)]">Configuraciones de la infraestructura PlastyFreddy</p>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)] text-xs">
                  <span>Modo Visual por Defecto</span>
                  <span className="font-bold uppercase text-cyan-500">{theme} Theme</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)] text-xs">
                  <span>Sincronización en Tiempo Real</span>
                  <span className="font-bold text-emerald-500">Activado (AES-256)</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs">
                  <span>Versión del Software</span>
                  <span className="font-mono text-[var(--text-muted)]">v2.4.0 — PROD_STABLE</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modal for New Sale */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onAddSale={handleAddSale}
      />
    </div>
  );
}
