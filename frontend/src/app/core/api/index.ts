export type { PageResponse } from './api.types';

export { AuthApi } from './auth.api';
export type { LoginRequest, AuthResponse, AuthUserInfo } from './auth.api';

export { UsersApi } from './users.api';
export type { UserResponse, CreateUserRequest, UpdateUserRequest } from './users.api';

export { RolesApi } from './roles.api';
export type { RoleResponse, PermissionResponse, CreateRoleRequest, UpdateRoleRequest } from './roles.api';

export { CategoriesApi } from './categories.api';
export type { CategoryResponse } from './categories.api';

export { ProductsApi } from './products.api';
export type { ProductResponse, CreateProductRequest, UpdateProductRequest, StockMovementResponse } from './products.api';

export { SalesApi } from './sales.api';
export type { SaleResponse, SaleItemResponse, CreateSaleRequest } from './sales.api';

export { OrdersApi } from './orders.api';
export type { CustomerOrderResponse, CreateOrderRequest } from './orders.api';

export { CustomersApi } from './customers.api';
export type { CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest } from './customers.api';

export { SuppliersApi } from './suppliers.api';
export type { SupplierResponse, CreateSupplierRequest, UpdateSupplierRequest } from './suppliers.api';

export { PurchasesApi } from './purchases.api';
export type { PurchaseResponse, PurchaseItemResponse, CreatePurchaseRequest } from './purchases.api';

export { PurchaseOrdersApi } from './purchase-orders.api';
export type { PurchaseOrderResponse, PurchaseOrderItemResponse, CreatePurchaseOrderRequest } from './purchase-orders.api';

export { NotificationsApi } from './notifications.api';
export type { NotificationResponse } from './notifications.api';

export { AuditApi } from './audit.api';
export type { AuditLogResponse } from './audit.api';

export { DashboardApi } from './dashboard.api';
export type { DashboardStats, RecentTransaction } from './dashboard.api';

export { StorageApi } from './storage.api';
export type { UploadResponse, UploadProgress } from './storage.api';

export { DispatchesApi } from './dispatches.api';
export type { DispatchResponse, DispatchHistoryResponse, CreateDispatchRequest, AssignDriverRequest } from './dispatches.api';

export { DriversApi } from './drivers.api';
export type { DeliveryDriverResponse, CreateDriverRequest as CreateDriverApiRequest, UpdateDriverRequest as UpdateDriverApiRequest } from './drivers.api';
