export type ViewMode = 
  | 'welcome' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'sales' 
  | 'orders' 
  | 'purchase-order' 
  | 'users' 
  | 'products' 
  | 'settings';

export type ThemeMode = 'light' | 'dark';

export interface Transaction {
  id: string;
  module: 'Ventas' | 'Compras' | 'Productos';
  description: string;
  status: 'Completado' | 'En Proceso' | 'Verificado' | 'Pendiente' | 'Cancelado';
  amount: string;
  date?: string;
  client?: string;
}

export interface SaleRecord {
  id: string;
  client: string;
  product: string;
  quantity: number;
  total: number;
  date: string;
  code?: string;
  status?: 'Completado' | 'Pendiente' | 'Reembolsado';
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  status: 'COMPLETED' | 'PENDING' | 'SHIPPED' | 'CANCELLED';
  client: string;
  date: string;
  units: number;
  totalAmount?: number;
  itemsSummary?: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  code: string;
  stock: number;
  unitPrice: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  category: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  description: string;
  category: 'Creation' | 'Edit' | 'System' | 'Report' | 'Auth';
  action: string;
}

export interface UserProfile {
  username: string;
  fullName: string;
  idNumber: string;
  memberSince: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  landline?: string;
  email: string;
  role: string;
  positionName: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
}
