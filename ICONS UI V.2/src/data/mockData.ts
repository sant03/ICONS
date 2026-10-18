import { Transaction, SaleRecord, OrderItem, ProductCatalogItem, AuditLog, UserProfile } from '../types';

export const initialTransactions: Transaction[] = [
  {
    id: '#VT-2045',
    module: 'Ventas',
    description: 'Venta de Mostrador - Cliente Final',
    status: 'Completado',
    amount: '$150.00',
    date: '15/02/2022 10:24 AM',
    client: 'Cliente Final'
  },
  {
    id: '#CM-1022',
    module: 'Compras',
    description: 'Suministro HP - Proveedor Global',
    status: 'En Proceso',
    amount: '$1,200.00',
    date: '15/02/2022 09:15 AM',
    client: 'Proveedor Global'
  },
  {
    id: '#PR-8821',
    module: 'Productos',
    description: 'Ajuste de Inventario - Almacén Norte',
    status: 'Verificado',
    amount: '-',
    date: '14/02/2022 04:45 PM',
    client: 'Interno'
  },
  {
    id: '#VT-2046',
    module: 'Ventas',
    description: 'Pedido Mayorista - Inversiones Potes',
    status: 'Pendiente',
    amount: '$2,450.00',
    date: '14/02/2022 02:10 PM',
    client: 'Inversiones Potes'
  },
  {
    id: '#CM-1023',
    module: 'Compras',
    description: 'Reposición Papelería - Librería Central',
    status: 'Completado',
    amount: '$45.00',
    date: '13/02/2022 11:30 AM',
    client: 'Librería Central'
  }
];

export const todaySalesRecords: SaleRecord[] = [
  { id: '#019', client: 'Adriana Lopez', product: 'Cups 6oz', quantity: 2, total: 3000, date: '2026-09-27', status: 'Completado' },
  { id: '#020', client: 'Juan Perez', product: 'Cups 6oz', quantity: 1, total: 1500, date: '2026-09-27', status: 'Completado' },
  { id: '#021', client: 'Roberto Soza', product: 'Cups 6oz', quantity: 5, total: 7500, date: '2026-09-27', status: 'Completado' },
  { id: '#022', client: 'Julio Casas', product: 'Cups 6oz', quantity: 1, total: 1500, date: '2026-09-27', status: 'Completado' }
];

export const historicalSalesRecords: SaleRecord[] = [
  { id: '1', date: '12/02/2022', client: 'Andres Ruiz', code: '001', product: 'Cup 6oz', quantity: 3, total: 3600, status: 'Completado' },
  { id: '2', date: '12/02/2022', client: 'Roberto Torres', code: '002', product: 'Napkin Pack', quantity: 1, total: 1500, status: 'Completado' },
  { id: '3', date: '12/02/2022', client: 'Roberto Soza', code: '003', product: 'Bag 2kg', quantity: 5, total: 7500, status: 'Completado' },
  { id: '4', date: '10/02/2022', client: 'Lucia Nariño', code: '004', product: 'Cups 8oz', quantity: 1, total: 1500, status: 'Completado' },
  { id: '5', date: '10/02/2022', client: 'Fernando Orozco', code: '005', product: 'Bags 3kg', quantity: 3, total: 6600, status: 'Completado' },
  { id: '6', date: '09/02/2022', client: 'Antonio Parra', code: '006', product: 'Straw Pack', quantity: 2, total: 2400, status: 'Completado' }
];

export const initialOrders: OrderItem[] = [
  { id: '1', orderNumber: 'Pedido 1', status: 'COMPLETED', client: 'Juan Lopez', date: '16/02/2022', units: 12, totalAmount: 4800 },
  { id: '2', orderNumber: 'Pedido 2', status: 'PENDING', client: 'Pedro Gomez', date: '17/02/2022', units: 5, totalAmount: 2100 },
  { id: '3', orderNumber: 'Pedido 3', status: 'SHIPPED', client: 'Esther Ruiz', date: '17/02/2022', units: 24, totalAmount: 9600 },
  { id: '4', orderNumber: 'Pedido 4', status: 'COMPLETED', client: 'Elizabeth Suarez', date: '17/02/2022', units: 8, totalAmount: 3200 },
  { id: '5', orderNumber: 'Pedido 5', status: 'PENDING', client: 'Andrea Marin', date: '18/02/2022', units: 15, totalAmount: 6000 },
  { id: '6', orderNumber: 'Pedido 6', status: 'SHIPPED', client: 'Armando Ortiz', date: '19/02/2022', units: 3, totalAmount: 1200 },
  { id: '7', orderNumber: 'Pedido 7', status: 'COMPLETED', client: 'Carlos Salazar', date: '19/02/2022', units: 10, totalAmount: 4000 },
  { id: '8', orderNumber: 'Pedido 8', status: 'PENDING', client: 'Sofia Vergara', date: '20/02/2022', units: 7, totalAmount: 2800 }
];

export const initialProducts: ProductCatalogItem[] = [
  { id: 'p1', name: 'P/B 1 LIBRA', code: 'SKU-101', stock: 3, unitPrice: 350, status: 'LOW_STOCK', category: 'Bolsas Plásticas' },
  { id: 'p2', name: 'P/B 2 LIBRAS', code: 'SKU-102', stock: 7, unitPrice: 500, status: 'IN_STOCK', category: 'Bolsas Plásticas' },
  { id: 'p3', name: 'P/B 3 LIBRAS', code: 'SKU-103', stock: 0, unitPrice: 650, status: 'OUT_OF_STOCK', category: 'Bolsas Plásticas' },
  { id: 'p4', name: 'PQTE PITILLO', code: 'SKU-201', stock: 13, unitPrice: 700, status: 'IN_STOCK', category: 'Desechables' },
  { id: 'p5', name: 'BAGS XL', code: 'SKU-104', stock: 25, unitPrice: 900, status: 'IN_STOCK', category: 'Bolsas Plásticas' },
  { id: 'p6', name: 'P/B Hielo Azul', code: 'SKU-105', stock: 18, unitPrice: 1200, status: 'IN_STOCK', category: 'Especiales' },
  { id: 'p7', name: 'P/B Boli Corto', code: 'SKU-106', stock: 40, unitPrice: 900, status: 'IN_STOCK', category: 'Especiales' },
  { id: 'p8', name: 'Cups 6oz', code: 'SKU-301', stock: 150, unitPrice: 1500, status: 'IN_STOCK', category: 'Vasos' },
  { id: 'p9', name: 'Cups 8oz', code: 'SKU-302', stock: 80, unitPrice: 1800, status: 'IN_STOCK', category: 'Vasos' },
  { id: 'p10', name: 'Napkin Pack', code: 'SKU-401', stock: 45, unitPrice: 1500, status: 'IN_STOCK', category: 'Papelería' }
];

export const userAuditLogs: AuditLog[] = [
  { id: 'a1', dateTime: '15/02/2022 3:30 PM', description: 'Created new sales record', category: 'Creation', action: 'View' },
  { id: 'a2', dateTime: '15/02/2022 10:15 AM', description: 'Edited product information', category: 'Edit', action: 'View' },
  { id: 'a3', dateTime: '15/02/2022 10:05 AM', description: 'User logged in', category: 'System', action: 'View' },
  { id: 'a4', dateTime: '14/02/2022 04:50 PM', description: 'Generated inventory report', category: 'Report', action: 'View' },
  { id: 'a5', dateTime: '13/02/2022 11:20 AM', description: 'Authorized purchase order #PO-992', category: 'Auth', action: 'View' }
];

export const initialUserProfile: UserProfile = {
  username: 'Angelly16',
  fullName: 'Angelly Lucia Gámez Castillo',
  idNumber: '#USR-2022-881',
  memberSince: '23/11/2021',
  dateOfBirth: '1995-06-16',
  age: 26,
  phone: '3045678903',
  landline: 'Optional',
  email: 'angelly@gmail.com',
  role: 'Administrative',
  positionName: 'Sales Assistant',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format',
  status: 'ACTIVE'
};
