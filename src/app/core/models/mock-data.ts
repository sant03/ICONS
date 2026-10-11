/**
 * Mock data ported 1:1 from "ICONS UI V.2/src/data/mockData.ts".
 */
import {
  Transaction,
  SaleRecord,
  OrderItem,
  ProductCatalogItem,
  AuditLog,
  UserProfile,
  StaffMember,
  Client,
  Supplier,
  PurchaseOrder,
} from './types';

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
  { id: '#019', client: 'Adriana Lopez', product: 'Cups 6oz', quantity: 2, unitPrice: 1500, total: 3000, date: '2026-09-27', status: 'Completado', paymentStatus: 'Pagado' },
  { id: '#020', client: 'Juan Perez', product: 'Cups 6oz', quantity: 1, unitPrice: 1500, total: 1500, date: '2026-09-27', status: 'Completado', paymentStatus: 'Pagado' },
  { id: '#021', client: 'Roberto Soza', product: 'Cups 6oz', quantity: 5, unitPrice: 1500, total: 7500, date: '2026-09-27', status: 'Completado', paymentStatus: 'Pagado' },
  { id: '#022', client: 'Julio Casas', product: 'Cups 6oz', quantity: 1, unitPrice: 1500, total: 1500, date: '2026-09-27', status: 'Pendiente', paymentStatus: 'Debe', amountDue: 1500, notes: 'Paga la próxima semana' }
];

export const historicalSalesRecords: SaleRecord[] = [
  { id: '1', date: '12/02/2022', client: 'Andres Ruiz', code: '001', product: 'Cup 6oz', quantity: 3, unitPrice: 1200, total: 3600, status: 'Completado', paymentStatus: 'Pagado' },
  { id: '2', date: '12/02/2022', client: 'Roberto Torres', code: '002', product: 'Napkin Pack', quantity: 1, unitPrice: 1500, total: 1500, status: 'Completado', paymentStatus: 'Pagado' },
  { id: '3', date: '12/02/2022', client: 'Roberto Soza', code: '003', product: 'Bag 2kg', quantity: 5, unitPrice: 1500, total: 7500, status: 'Completado', paymentStatus: 'Debe', amountDue: 3000, notes: 'Abono de $4.500' },
  { id: '4', date: '10/02/2022', client: 'Lucia Nariño', code: '004', product: 'Cups 8oz', quantity: 1, unitPrice: 1500, total: 1500, status: 'Completado', paymentStatus: 'Pagado' },
  { id: '5', date: '10/02/2022', client: 'Fernando Orozco', code: '005', product: 'Bags 3kg', quantity: 3, unitPrice: 2200, total: 6600, status: 'Completado', paymentStatus: 'Pagado' },
  { id: '6', date: '09/02/2022', client: 'Antonio Parra', code: '006', product: 'Straw Pack', quantity: 2, unitPrice: 1200, total: 2400, status: 'Pendiente', paymentStatus: 'Debe', amountDue: 2400 }
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

/**
 * Categories of the Productos module, ported from the `categoria` values of
 * "ICONS COMPLETE/src/data/mockData.ts" (`initialProducts`). The "Nueva
 * Categoría" modal appends new ones to the `AppStore.categories` signal.
 */
export const initialProductCategories: string[] = [
  'Bolsas de Libra',
  'Bolsas de Kilo',
  'Hielo',
  'Desechables',
];

export const initialProducts: ProductCatalogItem[] = [
  // Bolsas de Libra
  { id: 'p1', name: 'P/B 1/2 Libra', code: '1243', stock: 3, unitPrice: 1200, purchasePrice: 900, minPurchase: 13, unit: 'Und', status: 'LOW_STOCK', category: 'Bolsas de Libra' },
  { id: 'p2', name: 'P/B 1 Libra', code: '1244', stock: 25, unitPrice: 1500, purchasePrice: 1100, minPurchase: 10, unit: 'Und', status: 'IN_STOCK', category: 'Bolsas de Libra' },
  { id: 'p3', name: 'P/B 2 Libras', code: '1245', stock: 18, unitPrice: 2000, purchasePrice: 1400, minPurchase: 10, unit: 'Und', status: 'IN_STOCK', category: 'Bolsas de Libra' },
  { id: 'p4', name: 'P/B 3 Libras', code: '1246', stock: 0, unitPrice: 2500, purchasePrice: 1800, minPurchase: 15, unit: 'Und', status: 'OUT_OF_STOCK', category: 'Bolsas de Libra' },

  // Bolsas de Kilo
  { id: 'p5', name: 'P/B 2 Kilos', code: '1250', stock: 14, unitPrice: 3000, purchasePrice: 2200, minPurchase: 10, unit: 'Und', status: 'IN_STOCK', category: 'Bolsas de Kilo' },
  { id: 'p6', name: 'P/B 3 Kilos', code: '1251', stock: 20, unitPrice: 4200, purchasePrice: 3000, minPurchase: 8, unit: 'Und', status: 'IN_STOCK', category: 'Bolsas de Kilo' },
  { id: 'p7', name: 'P/B 5 Kilos', code: '1252', stock: 9, unitPrice: 6000, purchasePrice: 4500, minPurchase: 12, unit: 'Und', status: 'LOW_STOCK', category: 'Bolsas de Kilo' },

  // Hielo
  { id: 'p8', name: 'Hielo Largo', code: '1260', stock: 30, unitPrice: 1500, purchasePrice: 900, minPurchase: 20, unit: 'Pqt', status: 'IN_STOCK', category: 'Hielo' },
  { id: 'p9', name: 'Hielo Jumbo T', code: '1261', stock: 2, unitPrice: 2500, purchasePrice: 1600, minPurchase: 15, unit: 'Pqt', status: 'LOW_STOCK', category: 'Hielo' },
  { id: 'p10', name: 'Hielo Jumbo Azul', code: '1262', stock: 12, unitPrice: 2800, purchasePrice: 1800, minPurchase: 10, unit: 'Pqt', status: 'IN_STOCK', category: 'Hielo' },
  { id: 'p11', name: 'Hielo Corto', code: '1263', stock: 40, unitPrice: 1200, purchasePrice: 800, minPurchase: 20, unit: 'Pqt', status: 'IN_STOCK', category: 'Hielo' },

  // Desechables
  { id: 'p12', name: 'Vasos 6 onzas', code: '1084', stock: 150, unitPrice: 1500, purchasePrice: 1000, minPurchase: 50, unit: 'Pqt', status: 'IN_STOCK', category: 'Desechables' },
  { id: 'p13', name: 'Paquete Pitillo', code: '4567', stock: 13, unitPrice: 1200, purchasePrice: 700, minPurchase: 15, unit: 'Pqt', status: 'LOW_STOCK', category: 'Desechables' },
  { id: 'p14', name: 'Cucharas Plast', code: '3424', stock: 80, unitPrice: 1000, purchasePrice: 600, minPurchase: 25, unit: 'Pqt', status: 'IN_STOCK', category: 'Desechables' },
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

/**
 * Personal list of the Users module (NEW: the original React app had no
 * user-list screen). Built from the module mockup: 7 staff members grouped
 * as Administrativos / Gerenciales / Auxiliares, each one with its own
 * "Actividad Reciente" feed.
 *
 * Angelly16 mirrors `initialUserProfile` so the logged-in profile and the
 * entry of the list always show the same data.
 */
export const initialStaff: StaffMember[] = [
  {
    username: 'Freddy60',
    fullName: 'Freddy Potes',
    idNumber: '#USR-2021-401',
    memberSince: '05/09/2021',
    dateOfBirth: '1988-03-22',
    age: 34,
    phone: '3105551201',
    email: 'freddy@plastyfreddy.com',
    role: 'Gerente General',
    positionName: 'Gerente de Operaciones',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format',
    status: 'ACTIVE',
    group: 'Gerenciales',
    activities: [
      { id: 'fa1', description: 'Autorizó la orden de compra #PO-994', date: '15/02/2022', time: '4:10 pm' },
      { id: 'fa2', description: 'Actualizó los precios del catálogo', date: '13/02/2022', time: '9:40 am' }
    ]
  },
  {
    username: 'Angelly16',
    fullName: 'Angelly Lucia Gámez Castillo',
    idNumber: '#USR-2022-881',
    memberSince: '23/11/2021',
    dateOfBirth: '1995-06-16',
    age: 26,
    phone: '3045678903',
    email: 'angelly@gmail.com',
    role: 'Administrativa',
    positionName: 'Auxiliar Administrativa',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&auto=format',
    status: 'ACTIVE',
    group: 'Administrativos',
    activities: [
      { id: 'aa1', description: 'Creó nuevo registro de venta #021', date: '15/02/2022', time: '3:30 pm' },
      { id: 'aa2', description: 'Editó información del producto SKU-101', date: '15/02/2022', time: '10:15 am' }
    ]
  },
  {
    username: 'Santiago03',
    fullName: 'Santiago Mendoza',
    idNumber: '#USR-2022-104',
    memberSince: '10/01/2022',
    dateOfBirth: '1998-04-12',
    age: 23,
    phone: '3104567891',
    email: 'santiago.mendoza@gmail.com',
    role: 'Auxiliar de Ventas',
    positionName: 'Auxiliar de Bodega',
    avatarUrl: '',
    status: 'ACTIVE',
    group: 'Auxiliares',
    activities: [
      { id: 'sa1', description: 'Registró ingreso de mercancía en Compras', date: '14/02/2022', time: '2:15 pm' },
      { id: 'sa2', description: 'Actualizó el stock del producto SKU-301', date: '12/02/2022', time: '11:05 am' }
    ]
  },
  {
    username: 'Andres20',
    fullName: 'Andrés Ruiz',
    idNumber: '#USR-2022-217',
    memberSince: '18/05/2022',
    dateOfBirth: '1996-09-08',
    age: 25,
    phone: '3127788451',
    email: 'andres.ruiz@gmail.com',
    role: 'Auxiliar Administrativo',
    positionName: 'Auxiliar de Archivo',
    avatarUrl: '',
    status: 'ACTIVE',
    group: 'Administrativos',
    activities: [
      { id: 'an1', description: 'Generó reporte de inventario', date: '14/02/2022', time: '4:50 pm' },
      { id: 'an2', description: 'Editó datos del cliente Inversiones Potes', date: '11/02/2022', time: '1:20 pm' }
    ]
  },
  {
    username: 'Karolay24',
    fullName: 'Karolay Mendoza',
    idNumber: '#USR-2022-338',
    memberSince: '02/03/2022',
    dateOfBirth: '1999-11-30',
    age: 22,
    phone: '3156642290',
    email: 'karolay.mendoza@gmail.com',
    role: 'Auxiliar de Bodega',
    positionName: 'Auxiliar de Despacho',
    avatarUrl: '',
    status: 'ACTIVE',
    group: 'Auxiliares',
    activities: [
      { id: 'ka1', description: 'Despachó el pedido 1 a la bodega', date: '15/02/2022', time: '8:55 am' },
      { id: 'ka2', description: 'Registró ingreso de mercancía en Compras', date: '13/02/2022', time: '3:40 pm' }
    ]
  },
  {
    username: 'Javier89',
    fullName: 'Javier Potes',
    idNumber: '#USR-2021-772',
    memberSince: '14/10/2021',
    dateOfBirth: '1989-07-19',
    age: 32,
    phone: '3174458890',
    email: 'javier.potes@gmail.com',
    role: 'Gerente de Ventas',
    positionName: 'Jefe de Ventas',
    avatarUrl: '',
    status: 'ACTIVE',
    group: 'Gerenciales',
    activities: [
      { id: 'ja1', description: 'Autorizó el pedido 5', date: '12/02/2022', time: '10:30 am' }
    ]
  },
  {
    username: 'Esther07',
    fullName: 'Esther Ruiz',
    idNumber: '#USR-2022-512',
    memberSince: '27/06/2022',
    dateOfBirth: '1997-02-05',
    age: 25,
    phone: '3008891174',
    email: 'esther.ruiz@gmail.com',
    role: 'Administrativa',
    positionName: 'Auxiliar de Caja',
    avatarUrl: '',
    status: 'ACTIVE',
    group: 'Administrativos',
    activities: [
      { id: 'es1', description: 'Cerró la caja del día', date: '15/02/2022', time: '6:20 pm' },
      { id: 'es2', description: 'Creó nuevo registro de venta #019', date: '15/02/2022', time: '7:15 am' }
    ]
  }
];

/** Clients tab of the Clients/Prov module (built from the module mockup). */
export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Adriana Lopez',
    docId: '1109854369',
    phone: '304567894',
    email: 'Adrilopez@gmail.co',
    address: 'Calle 83 # 25a 163',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'cli-2',
    name: 'Carlos Rodriguez',
    docId: '1023456789',
    phone: '3005764568',
    email: 'carlos.rodriguez@gmail.com',
    address: 'Carrera 15 # 93-45',
  },
  {
    id: 'cli-3',
    name: 'Rodrigo Perez',
    docId: '1098234122',
    phone: '3112345678',
    email: 'rodrigo.perez@gmail.com',
    address: 'Carrera 7 # 72-41',
  },
  {
    id: 'cli-4',
    name: 'Roberto Soza',
    docId: '1073829102',
    phone: '3159876543',
    email: 'roberto.soza@gmail.com',
    address: 'Calle 45 # 19-27',
  },
  {
    id: 'cli-5',
    name: 'Lucia Nariño',
    docId: '1019283746',
    phone: '3187654321',
    email: 'lucia.narino@gmail.com',
    address: 'Carrera 11 # 93-52',
  },
  {
    id: 'cli-6',
    name: 'Andres Ruiz',
    docId: '1034928172',
    phone: '3023456789',
    email: 'andres.ruiz@gmail.com',
    address: 'Calle 100 # 13-21',
  },
];

/** Proveedores tab of the Clients/Prov module (built from the module mockup). */
export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Plastidias',
    code: '1234',
    phone: '304567894',
    email: 'plastidias@gmail.com',
    address: 'Carrera 34 # 80 - 50',
    avatarUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop&auto=format',
  },
  {
    id: 'sup-2',
    name: 'Plasticos Roa',
    code: '12345',
    phone: '3012345678',
    email: 'plasticos.roa@gmail.com',
    address: 'Carrera 50 # 24-15',
  },
  {
    id: 'sup-3',
    name: 'PS Seas',
    code: '11223',
    phone: '3109876543',
    email: 'psseas@gmail.com',
    address: 'Calle 26 # 69-38',
  },
  {
    id: 'sup-4',
    name: 'Desechables D & M',
    code: '11445',
    phone: '3201239876',
    email: 'desechables.dm@gmail.com',
    address: 'Carrera 68 # 42-10',
  },
  {
    id: 'sup-5',
    name: 'Distribuidora Atlantico',
    code: '11556',
    phone: '3054321098',
    email: 'atlantico@gmail.com',
    address: 'Calle 13 # 68-70',
  },
  {
    id: 'sup-6',
    name: 'Geronimo Plasticos',
    code: '11667',
    phone: '314567901',
    email: 'geronimo.plasticos@gmail.com',
    address: 'Carrera 45 # 18-60',
  },
];

/**
 * Orden de Compra documents of the list + detail views.
 * Ported 1:1 from "ICONS COMPLETE/src/data/mockData.ts" (`initialPurchaseOrders`).
 */
export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'Orden 003',
    orderNo: '003',
    date: '16/02/2022',
    madeOn: '16/02/2022',
    receptionDate: '22/02/2022',
    status: 'Disponible',
    supplier: 'Plastidias',
    supplierAddress: 'Calle 43 # 58 30',
    supplierPhone: '3045678493',
    supplierEmail: 'plastidias@gmail.com',
    madeBy: 'Freddy Javier Potes Vasquez',
    user: 'Fredyy60',
    area: 'Bodega / Inventario',
    paymentMethod: 'Crédito 30 días',
    items: [
      { productId: 'p2', product: 'P/B 1 Libra', quantity: 5, unitPrice: 350, total: 1750 },
      { productId: 'p13', product: 'Pqte Pitillo', quantity: 3, unitPrice: 700, total: 2100 },
      { productId: 'p10', product: 'P/B Hielo Azul', quantity: 6, unitPrice: 1200, total: 7800 },
      { productId: 'p15', product: 'P/B Boli Corto', quantity: 10, unitPrice: 900, total: 8700 },
      { productId: 'p12', product: 'Pqte Vasos 6 Oz', quantity: 12, unitPrice: 1200, total: 12000 },
      { productId: 'p14', product: 'Cucharas', quantity: 7, unitPrice: 1500, total: 6500 },
    ],
    total: 80700,
    totalProducts: 36,
    approvedBy: 'Gerencia General',
  },
  {
    id: 'Orden 006',
    orderNo: '006',
    date: '16/02/2022',
    madeOn: '16/02/2022',
    receptionDate: '20/02/2022',
    status: 'Disponible',
    supplier: 'Plasticos Roa',
    supplierAddress: 'Calle 43 # 58 30',
    supplierPhone: '3012345678',
    supplierEmail: 'contacto@plasticosroa.com',
    madeBy: 'Angelly16',
    user: 'Angelly16',
    area: 'Ventas',
    paymentMethod: 'Contado',
    items: [
      { productId: 'p1', product: 'P/B 1/2 Libra', quantity: 10, unitPrice: 900, total: 9000 },
      { productId: 'p8', product: 'Hielo Largo', quantity: 15, unitPrice: 900, total: 13500 },
    ],
    total: 22500,
    totalProducts: 25,
  },
  {
    id: 'Orden 005',
    orderNo: '005',
    date: '25/01/2022',
    madeOn: '25/01/2022',
    receptionDate: '28/01/2022',
    status: 'Usada',
    supplier: 'PS Seas',
    madeBy: 'Fredyy60',
    user: 'Fredyy60',
    area: 'Compras',
    paymentMethod: 'Contado',
    items: [
      { productId: 'p12', product: 'Vasos 6 onzas', quantity: 20, unitPrice: 1000, total: 20000 },
    ],
    total: 20000,
    totalProducts: 20,
  },
  {
    id: 'Orden 004',
    orderNo: '004',
    date: '30/12/2021',
    madeOn: '30/12/2021',
    receptionDate: '05/01/2022',
    status: 'Usada',
    supplier: 'Plastidias',
    madeBy: 'Fredyy60',
    user: 'Fredyy60',
    area: 'Bodega',
    paymentMethod: 'Crédito',
    items: [
      { productId: 'p2', product: 'P/B 1 Libra', quantity: 30, unitPrice: 350, total: 10500 },
    ],
    total: 10500,
    totalProducts: 30,
  },
  {
    id: 'Orden 002',
    orderNo: '002',
    date: '16/02/2022',
    madeOn: '16/02/2022',
    receptionDate: '18/02/2022',
    status: 'Usada',
    supplier: 'Desechables D & M',
    madeBy: 'Angelly16',
    user: 'Angelly16',
    area: 'Ventas',
    paymentMethod: 'Contado',
    items: [
      { productId: 'p14', product: 'Cucharas', quantity: 10, unitPrice: 600, total: 6000 },
    ],
    total: 6000,
    totalProducts: 10,
  },
  {
    id: 'Orden 001',
    orderNo: '001',
    date: '16/02/2022',
    madeOn: '16/02/2022',
    receptionDate: '17/02/2022',
    status: 'Usada',
    supplier: 'Plastidias',
    madeBy: 'Fredyy60',
    user: 'Fredyy60',
    area: 'Administración',
    paymentMethod: 'Contado',
    items: [
      { productId: 'p1', product: 'P/B 1/2 Libra', quantity: 50, unitPrice: 900, total: 45000 },
    ],
    total: 45000,
    totalProducts: 50,
  },
];
