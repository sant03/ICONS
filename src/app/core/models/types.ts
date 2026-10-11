/**
 * Ported 1:1 from "ICONS UI V.2/src/types.ts".
 *
 * The original union had no `profile` value (the personal profile was the
 * `users` view). `profile` was added when the Users module was split into the
 * module list (`users`) and the personal profile editor (`profile`).
 * `clients` / `suppliers` were added with the Clients/Prov module (the two
 * tabs of the same screen, one route each).
 * `purchase-orders` / `purchase-order-detail` were added with the Orden de
 * Compra module: the sidebar opens the list (`purchase-orders`), every card of
 * it links to the document detail (`purchase-order-detail`), and
 * `purchase-order` stays the "Crear Nueva Orden de Compra" form.
 */
export type ViewMode =
  | 'welcome'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'sales'
  | 'orders'
  | 'purchase-orders'
  | 'purchase-order-detail'
  | 'purchase-order'
  | 'users'
  | 'profile'
  | 'products'
  | 'settings'
  | 'clients'
  | 'suppliers';

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

/**
 * Payment state of a sale, ported from "ICONS COMPLETE/src/types/sales.ts"
 * (`estadoPago`). Drives the "ESTADO DE PAGO" column of the Sales module.
 */
export type PaymentStatus = 'Pagado' | 'Debe';

export interface SaleRecord {
  id: string;
  client: string;
  product: string;
  quantity: number;
  /** Unit price of the record; `total` is always `quantity * unitPrice`. */
  unitPrice: number;
  total: number;
  date: string;
  code?: string;
  status?: 'Completado' | 'Pendiente' | 'Reembolsado';
  /** "ESTADO DE PAGO" column (Pagado / Debe). */
  paymentStatus: PaymentStatus;
  /** Amount still owed; only meaningful when `paymentStatus` is "Debe". */
  amountDue?: number;
  /** Free notes shown by the edit modal. */
  notes?: string;
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

/**
 * Unit of measure of a catalog item, ported from
 * "ICONS COMPLETE/src/types/inventory.ts" (`unidadMedida`).
 */
export type ProductUnit = 'Und' | 'Pqt' | 'Kg' | 'Lb';

/**
 * Product of the Productos module (grid by category + detail sidebar), ported
 * 1:1 from "ICONS COMPLETE/src/types/inventory.ts" (`Product`):
 *   referencia -> name · codigo -> code · cantidad -> stock
 *   precioVenta -> unitPrice · precioCompra -> purchasePrice
 *   minimoCompra -> minPurchase · unidadMedida -> unit · porAgotarse -> status
 */
export interface ProductCatalogItem {
  id: string;
  name: string;
  code: string;
  stock: number;
  unitPrice: number;
  purchasePrice: number;
  /** Threshold below which the product is flagged "Por Agotarse". */
  minPurchase: number;
  unit: ProductUnit;
  /** Derived by the store on every write: 0 -> OUT_OF_STOCK, <= minPurchase -> LOW_STOCK. */
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

/** Role buckets used by the Users module filter pills. */
export type StaffGroup = 'Administrativos' | 'Gerenciales' | 'Auxiliares';

/** One entry of the "Actividad Reciente" feed of a staff member. */
export interface UserActivity {
  id: string;
  description: string;
  date: string;
  time: string;
}

/**
 * A member of the personal list of the Users module. Extends the personal
 * `UserProfile` with the role group (filter pills) and the activity feed.
 */
export interface StaffMember extends UserProfile {
  group: StaffGroup;
  activities: UserActivity[];
}

/** One row of the Clientes tab of the Clients/Prov module. */
export interface Client {
  id: string;
  name: string;
  /** National ID shown as `CC / ID: …` in the list and the detail card. */
  docId: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl?: string;
}

/** One row of the Proveedores tab of the Clients/Prov module. */
export interface Supplier {
  id: string;
  name: string;
  /** Supplier code shown as `Código Prov: …` in the list. */
  code: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl?: string;
}

/** One line of the item table of an Orden de Compra. */
export interface PurchaseOrderItem {
  productId: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Purchase order document of the Orden de Compra module (list + detail views).
 * Ported 1:1 from "ICONS COMPLETE/src/types/inventory.ts".
 */
export interface PurchaseOrder {
  /** e.g. "Orden 003" */
  id: string;
  /** Short order number used in the URL of the detail view, e.g. "003". */
  orderNo: string;
  date: string;
  madeOn: string;
  receptionDate: string;
  status: 'Disponible' | 'Usada' | 'Pendiente' | 'Cancelada';
  supplier: string;
  supplierAddress?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  madeBy: string;
  user: string;
  area: string;
  paymentMethod: string;
  items: PurchaseOrderItem[];
  total: number;
  totalProducts: number;
  approvedBy?: string;
}
