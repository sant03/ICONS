# ICONS v2 — Inventario de Servicios API

> **Base URL:** `http://localhost:8080`
> **Autenticación:** Bearer JWT (header `Authorization: Bearer <token>`)
> **Respuestas paginadas:** `PageResponse<T>` con campos `content`, `totalElements`, `totalPages`, `page`, `size`
> **Errores:** RFC 7807 ProblemDetail (`application/problem+json`)

---

## 1. Auth (`/auth`) — Pública

| Método | Endpoint | Body | Respuesta | Descripción |
|--------|----------|------|-----------|-------------|
| `POST` | `/auth/login` | `LoginRequest` | `AuthResponse` | Iniciar sesión (devuelve accessToken + refreshToken) |
| `POST` | `/auth/refresh` | `RefreshRequest` | `AuthResponse` | Renovar tokens (rotación de refresh token) |
| `POST` | `/auth/logout` | `RefreshRequest` | `204` | Cerrar sesión (revocar refresh token) |
| `POST` | `/auth/logout-all` | — | `204` | Cerrar todas las sesiones del usuario |
| `POST` | `/auth/password-reset/request` | `PasswordResetRequest` | `200` | Solicitar código de reset (6 dígitos) |
| `POST` | `/auth/password-reset/confirm` | `PasswordResetConfirmRequest` | `200` | Confirmar reset con código |
| `GET` | `/auth/me` | — | `AuthUserInfo` | Datos del usuario autenticado |

### DTOs

```
LoginRequest { tenant, username, password }
RefreshRequest { refreshToken }
AuthResponse { accessToken, refreshToken, user: AuthUserInfo }
AuthUserInfo { id, username, fullName, email, avatarUrl, status, tenantName, tenantSlug }
PasswordResetRequest { tenant, email }
PasswordResetConfirmRequest { tenant, email, code, newPassword }
```

---

## 2. Users (`/users`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/users?search=&page=&size=` | `USERS_VIEW` | — | `PageResponse<UserResponse>` | Listar usuarios (búsqueda por nombre/username/email) |
| `GET` | `/users/{id}` | `USERS_VIEW` | — | `UserResponse` | Detalle de usuario |
| `POST` | `/users` | `USERS_CREATE` | `CreateUserRequest` | `UserResponse` | Crear usuario |
| `PUT` | `/users/{id}` | `USERS_EDIT` | `UpdateUserRequest` | `UserResponse` | Actualizar usuario |
| `POST` | `/users/{id}/change-password` | — (self only) | `ChangePasswordRequest` | `204` | Cambiar contraseña propia |
| `POST` | `/users/{id}/reset-password` | `USERS_EDIT` | — | `200` | Reset de contraseña (admin) |
| `POST` | `/users/{id}/unlock` | `USERS_EDIT` | — | `200` | Desbloquear usuario |

### DTOs

```
CreateUserRequest { username, email, password, fullName, docId, dateOfBirth, phone, landline, positionName, roleId }
UpdateUserRequest { email?, fullName?, docId?, dateOfBirth?, phone?, landline?, positionName?, avatarUrl?, roleId?, status? }
UserResponse { id, username, email, fullName, docId, dateOfBirth, phone, landline, positionName, avatarUrl, roleName, status, createdAt }
ChangePasswordRequest { currentPassword, newPassword }
```

---

## 3. Roles (`/roles`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/roles` | `ROLES_VIEW` | — | `List<RoleResponse>` | Listar roles del tenant |
| `GET` | `/roles/{id}` | `ROLES_VIEW` | — | `RoleResponse` | Detalle de rol (con permisos) |
| `POST` | `/roles` | `ROLES_CREATE` | `CreateRoleRequest` | `RoleResponse` | Crear rol |
| `PUT` | `/roles/{id}` | `ROLES_EDIT` | `UpdateRoleRequest` | `RoleResponse` | Actualizar rol |
| `GET` | `/roles/permissions` | `ROLES_VIEW` | — | `List<PermissionResponse>` | Listar todos los permisos disponibles |

### DTOs

```
CreateRoleRequest { name, description, permissionCodes: String[] }
UpdateRoleRequest { name?, description?, permissionCodes?: String[] }
RoleResponse { id, name, description, system, permissions: PermissionResponse[] }
PermissionResponse { id, code, description }
```

---

## 4. Categories (`/categories`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/categories?page=&size=` | `PRODUCTS_VIEW` | — | `PageResponse<CategoryResponse>` | Listar categorías |
| `GET` | `/categories/{id}` | `PRODUCTS_VIEW` | — | `CategoryResponse` | Detalle de categoría |
| `POST` | `/categories` | `PRODUCTS_CREATE` | `CreateCategoryRequest` | `CategoryResponse` | Crear categoría |
| `PUT` | `/categories/{id}` | `PRODUCTS_EDIT` | `UpdateCategoryRequest` | `CategoryResponse` | Actualizar categoría |
| `DELETE` | `/categories/{id}` | `PRODUCTS_DELETE` | — | `204` | Eliminar categoría (soft delete) |

### DTOs

```
CreateCategoryRequest { name }
UpdateCategoryRequest { name?, status? }
CategoryResponse { id, name, status, createdAt }
```

---

## 5. Products (`/products`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/products?search=&categoryId=&page=&size=` | `PRODUCTS_VIEW` | — | `PageResponse<ProductResponse>` | Listar productos (búsqueda + filtro por categoría) |
| `GET` | `/products/{id}` | `PRODUCTS_VIEW` | — | `ProductResponse` | Detalle de producto |
| `POST` | `/products` | `PRODUCTS_CREATE` | `CreateProductRequest` | `ProductResponse` | Crear producto (código auto-generado) |
| `PUT` | `/products/{id}` | `PRODUCTS_EDIT` | `UpdateProductRequest` | `ProductResponse` | Actualizar producto |
| `DELETE` | `/products/{id}` | `PRODUCTS_DELETE` | — | `204` | Eliminar producto (solo si stock = 0) |
| `PATCH` | `/products/{id}/toggle-block` | `PRODUCTS_EDIT` | — | `ProductResponse` | Bloquear/desbloquear producto |
| `POST` | `/products/{id}/stock-adjustment` | `INVENTORY_ADJUST` | `StockAdjustmentRequest` | `StockMovementResponse` | Ajustar stock (+ o -) |
| `GET` | `/products/{id}/movements?page=&size=` | `INVENTORY_VIEW` | — | `PageResponse<StockMovementResponse>` | Historial de movimientos de stock |

### DTOs

```
CreateProductRequest { reference, categoryId, stock, minPurchase, purchasePrice, salePrice, unit, imageUrl }
UpdateProductRequest { reference?, categoryId?, minPurchase?, purchasePrice?, salePrice?, unit?, imageUrl? }
ProductResponse { id, code, reference, categoryId, categoryName, stock, minPurchase, purchasePrice, salePrice, unit, imageUrl, blocked, status, createdAt }
StockAdjustmentRequest { type: "ADJUSTMENT_IN"|"ADJUSTMENT_OUT", quantity, notes }
StockMovementResponse { id, productId, type, quantity, stockAfter, referenceType, referenceId, notes, createdBy, createdAt }
```

> **status** (computado): `BLOCKED`, `OUT_OF_STOCK`, `LOW_STOCK`, `AVAILABLE`

---

## 6. Sales (`/sales`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/sales?search=&customerId=&paymentStatus=&page=&size=` | `SALES_VIEW` | — | `PageResponse<SaleResponse>` | Listar ventas (búsqueda + filtros) |
| `GET` | `/sales/{id}` | `SALES_VIEW` | — | `SaleResponse` | Detalle de venta (con ítems) |
| `POST` | `/sales` | `SALES_CREATE` | `CreateSaleRequest` | `SaleResponse` | Crear venta (descuenta stock) |
| `POST` | `/sales/{id}/payment` | `SALES_EDIT` | `PaymentRequest` | `SaleResponse` | Registrar pago parcial/total |
| `POST` | `/sales/{id}/cancel` | `SALES_CANCEL` | — | `SaleResponse` | Cancelar venta (devuelve stock) |

### DTOs

```
CreateSaleRequest { customerId, customerName, date, notes, items: CreateSaleItemRequest[] }
CreateSaleItemRequest { productId, quantity, unitPrice }
PaymentRequest { amount }
SaleResponse { id, code, customerId, customerName, date, subtotal, total, amountPaid, amountDue, paymentStatus, status, notes, cancelledAt, items: SaleItemResponse[], createdAt }
SaleItemResponse { id, productId, productName, quantity, unitPrice, total }
```

> **paymentStatus**: `PAGADO`, `NO_PAGADO`, `PARCIAL`

---

## 7. Customer Orders (`/orders`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/orders?search=&status=&page=&size=` | `ORDERS_VIEW` | — | `PageResponse<CustomerOrderResponse>` | Listar pedidos de clientes |
| `GET` | `/orders/{id}` | `ORDERS_VIEW` | — | `CustomerOrderResponse` | Detalle de pedido |
| `POST` | `/orders` | `ORDERS_CREATE` | `CreateOrderRequest` | `CustomerOrderResponse` | Crear pedido |
| `POST` | `/orders/{orderId}/sales/{saleId}` | `ORDERS_EDIT` | — | `CustomerOrderResponse` | Vincular venta a pedido (recalcula totales) |
| `PATCH` | `/orders/{id}/status?status=` | `ORDERS_EDIT` | — | `CustomerOrderResponse` | Cambiar estado del pedido |

### DTOs

```
CreateOrderRequest { customerId, customerName, date }
CustomerOrderResponse { id, code, customerId, customerName, date, status, totalUnits, totalAmount, itemsSummary, sales: SaleResponse[], createdAt }
```

---

## 8. Customers (`/customers`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/customers?search=&page=&size=` | `CUSTOMERS_VIEW` | — | `PageResponse<CustomerResponse>` | Listar clientes (búsqueda por nombre/docId/phone) |
| `GET` | `/customers/{id}` | `CUSTOMERS_VIEW` | — | `CustomerResponse` | Detalle de cliente |
| `POST` | `/customers` | `CUSTOMERS_CREATE` | `CreateCustomerRequest` | `CustomerResponse` | Crear cliente |
| `PUT` | `/customers/{id}` | `CUSTOMERS_EDIT` | `UpdateCustomerRequest` | `CustomerResponse` | Actualizar cliente |
| `DELETE` | `/customers/{id}` | `CUSTOMERS_DELETE` | — | `204` | Eliminar cliente (soft delete) |

### DTOs

```
CreateCustomerRequest { name, docId, phone, email, address }
UpdateCustomerRequest { name?, docId?, phone?, email?, address?, avatarUrl? }
CustomerResponse { id, name, docId, phone, email, address, avatarUrl, createdAt }
```

---

## 9. Suppliers (`/suppliers`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/suppliers?search=&page=&size=` | `SUPPLIERS_VIEW` | — | `PageResponse<SupplierResponse>` | Listar proveedores (búsqueda por nombre/código) |
| `GET` | `/suppliers/{id}` | `SUPPLIERS_VIEW` | — | `SupplierResponse` | Detalle de proveedor |
| `POST` | `/suppliers` | `SUPPLIERS_CREATE` | `CreateSupplierRequest` | `SupplierResponse` | Crear proveedor (código auto-generado) |
| `PUT` | `/suppliers/{id}` | `SUPPLIERS_EDIT` | `UpdateSupplierRequest` | `SupplierResponse` | Actualizar proveedor |
| `DELETE` | `/suppliers/{id}` | `SUPPLIERS_DELETE` | — | `204` | Eliminar proveedor (soft delete) |

### DTOs

```
CreateSupplierRequest { name, phone, email, address }
UpdateSupplierRequest { name?, phone?, email?, address?, avatarUrl? }
SupplierResponse { id, code, name, phone, email, address, avatarUrl, createdAt }
```

---

## 10. Purchases (`/purchases`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/purchases?search=&page=&size=` | `PURCHASES_VIEW` | — | `PageResponse<PurchaseResponse>` | Listar compras |
| `GET` | `/purchases/{id}` | `PURCHASES_VIEW` | — | `PurchaseResponse` | Detalle de compra (con ítems) |
| `POST` | `/purchases` | `PURCHASES_CREATE` | `CreatePurchaseRequest` | `PurchaseResponse` | Crear compra (incrementa stock) |
| `POST` | `/purchases/{id}/cancel` | `PURCHASES_CANCEL` | — | `PurchaseResponse` | Cancelar compra (revierte stock) |

### DTOs

```
CreatePurchaseRequest { supplierId, supplierName, date, notes, items: CreatePurchaseItemRequest[] }
CreatePurchaseItemRequest { productId, quantity, unitPrice }
PurchaseResponse { id, code, supplierId, supplierName, date, total, status, notes, cancelledAt, items: PurchaseItemResponse[], createdAt }
PurchaseItemResponse { id, productId, productName, quantity, unitPrice, total }
```

---

## 11. Purchase Orders (`/purchase-orders`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/purchase-orders?search=&status=&page=&size=` | `PURCHASE_ORDERS_VIEW` | — | `PageResponse<PurchaseOrderResponse>` | Listar órdenes de compra |
| `GET` | `/purchase-orders/{id}` | `PURCHASE_ORDERS_VIEW` | — | `PurchaseOrderResponse` | Detalle de orden (con ítems) |
| `POST` | `/purchase-orders` | `PURCHASE_ORDERS_CREATE` | `CreatePurchaseOrderRequest` | `PurchaseOrderResponse` | Crear orden de compra |
| `PATCH` | `/purchase-orders/{id}/status?status=` | `PURCHASE_ORDERS_EDIT` | — | `PurchaseOrderResponse` | Cambiar estado de orden |

### DTOs

```
CreatePurchaseOrderRequest { supplierId, supplierName, supplierAddress, supplierPhone, supplierEmail, date, madeOn, receptionDate, madeBy, area, paymentMethod, approvedBy, scheduledDate, items: CreatePurchaseOrderItemRequest[] }
CreatePurchaseOrderItemRequest { productId, quantity, unitPrice }
PurchaseOrderResponse { id, code, supplierId, supplierName, supplierAddress, supplierPhone, supplierEmail, date, madeOn, receptionDate, status, madeBy, userUsername, area, paymentMethod, totalProducts, total, approvedBy, scheduledDate, items: PurchaseOrderItemResponse[], createdAt }
PurchaseOrderItemResponse { id, productId, productName, quantity, unitPrice, total }
```

> **status**: `DISPONIBLE`, `USADA`, `PENDIENTE`, `CANCELADA`

---

## 12. Notifications (`/notifications`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/notifications?filter=&page=&size=` | `NOTIFICATION_VIEW` | — | `PageResponse<NotificationResponse>` | Listar notificaciones (filter: `all`\|`unread`) |
| `GET` | `/notifications/unread-count` | `NOTIFICATION_VIEW` | — | `{ count: number }` | Contador de no leídas |
| `PATCH` | `/notifications/{id}/read` | `NOTIFICATION_VIEW` | — | `204` | Marcar como leída |
| `PATCH` | `/notifications/read-all` | `NOTIFICATION_VIEW` | — | `204` | Marcar todas como leídas |
| `DELETE` | `/notifications/{id}` | `NOTIFICATION_VIEW` | — | `204` | Eliminar notificación |
| `DELETE` | `/notifications` | `NOTIFICATION_VIEW` | — | `204` | Limpiar todas |

### DTOs

```
NotificationResponse { id, title, description, type, read, link, createdAt }
```

> **type**: `order`, `stock`, `user`, `payment`, `system`

---

## 13. Audit Log (`/audit`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/audit?search=&category=&page=&size=` | `AUDIT_VIEW` | — | `PageResponse<AuditLogResponse>` | Listar historial de auditoría |
| `DELETE` | `/audit` | `AUDIT_CLEAR` | — | `204` | Limpiar historial completo |

### DTOs

```
AuditLogResponse { id, userId, username, action, category, entityType, entityId, description, ipAddress, createdAt }
```

---

## 14. Dashboard (`/dashboard`) — Requiere JWT

| Método | Endpoint | Permiso | Body | Respuesta | Descripción |
|--------|----------|---------|------|-----------|-------------|
| `GET` | `/dashboard/stats` | — | — | `DashboardStatsResponse` | Métricas del panel de control |

### DTOs

```
DashboardStatsResponse {
  salesToday: { total, count },
  stockAlert: { outOfStock, lowStock },
  pendingOrders: number,
  newCustomersThisMonth: number,
  recentTransactions: RecentTransaction[]
}
RecentTransaction { id, module, description, status, amount, date, client }
```

---

## Resumen de Endpoints

| Módulo | Endpoints | Permisos |
|--------|-----------|----------|
| Auth | 7 | Público |
| Users | 7 | `USERS_*` |
| Roles | 5 | `ROLES_*` |
| Categories | 5 | `PRODUCTS_*` |
| Products | 8 | `PRODUCTS_*`, `INVENTORY_*` |
| Sales | 5 | `SALES_*` |
| Customer Orders | 5 | `ORDERS_*` |
| Customers | 5 | `CUSTOMERS_*` |
| Suppliers | 5 | `SUPPLIERS_*` |
| Purchases | 4 | `PURCHASES_*` |
| Purchase Orders | 4 | `PURCHASE_ORDERS_*` |
| Notifications | 6 | `NOTIFICATION_VIEW` |
| Audit Log | 2 | `AUDIT_VIEW`, `AUDIT_CLEAR` |
| Dashboard | 1 | — |
| **Total** | **69** | |
