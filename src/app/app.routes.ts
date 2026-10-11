import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { WelcomeAuth } from './features/welcome/welcome-auth';
import { Dashboard } from './features/dashboard/dashboard';
import { SalesView } from './features/sales/sales-view';
import { OrdersView } from './features/orders/orders-view';
import { PurchaseOrderView } from './features/purchase-order/purchase-order-view';
import { UsersView } from './features/users/users-view';
import { Profile } from './features/profile/profile';
import { ProductsView } from './features/products/products-view';
import { SettingsView } from './features/settings/settings-view';
import { ClientsView } from './features/clients/clients-view';
import { SuppliersView } from './features/suppliers/suppliers-view';
import { PurchaseOrdersView } from './features/purchase-orders/purchase-orders-view';
import { PurchaseOrderDetailView } from './features/purchase-order-detail/purchase-order-detail-view';

/**
 * The React app kept `currentView` in state. Here the same `ViewMode` values
 * become route paths so the URLs stay 1:1 with the `ViewMode` union.
 *
 * `welcome` | `login` | `register` render full-screen (no shell), exactly like
 * the early return in `App.tsx`; every other view renders inside the shell.
 *
 * The original `users` view was the personal profile editor. The Users module
 * list took over `/users` and the personal editor moved to `/profile`.
 *
 * `clients` and `suppliers` are the two tabs of the Clients/Prov module: each
 * tab is its own route so the URL always matches the tab on screen.
 *
 * The Orden de Compra module keeps the three sub-views of the original React
 * screen as three routes: `purchase-orders` is the list the sidebar opens,
 * `purchase-order-detail/:id` the document of one order (`:id` is its short
 * order number) and `purchase-order` the "Crear Nueva Orden de Compra" form.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  { path: 'welcome', component: WelcomeAuth, data: { mode: 'welcome' } },
  { path: 'login', component: WelcomeAuth, data: { mode: 'login' } },
  { path: 'register', component: WelcomeAuth, data: { mode: 'register' } },

  {
    path: '',
    component: Shell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'sales', component: SalesView },
      { path: 'orders', component: OrdersView },
      { path: 'purchase-orders', component: PurchaseOrdersView },
      { path: 'purchase-order-detail/:id', component: PurchaseOrderDetailView },
      { path: 'purchase-order', component: PurchaseOrderView },
      { path: 'users', component: UsersView },
      { path: 'profile', component: Profile },
      { path: 'products', component: ProductsView },
      { path: 'settings', component: SettingsView },
      { path: 'clients', component: ClientsView },
      { path: 'suppliers', component: SuppliersView },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
