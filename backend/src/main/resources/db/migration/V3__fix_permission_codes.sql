-- Align permission codes with controller @PreAuthorize annotations (singular → plural)

-- Sales
UPDATE permissions SET code = 'SALES_VIEW'    WHERE code = 'SALE_VIEW';
UPDATE permissions SET code = 'SALES_CREATE'  WHERE code = 'SALE_CREATE';
UPDATE permissions SET code = 'SALES_EDIT'    WHERE code = 'SALE_EDIT';
UPDATE permissions SET code = 'SALES_CANCEL'  WHERE code = 'SALE_DELETE';

-- Purchases
UPDATE permissions SET code = 'PURCHASES_VIEW'   WHERE code = 'PURCHASE_VIEW';
UPDATE permissions SET code = 'PURCHASES_CREATE' WHERE code = 'PURCHASE_CREATE';
UPDATE permissions SET code = 'PURCHASES_CANCEL' WHERE code = 'PURCHASE_EDIT';
UPDATE permissions SET code = 'PURCHASES_DELETE' WHERE code = 'PURCHASE_DELETE';

-- Products
UPDATE permissions SET code = 'PRODUCTS_VIEW'   WHERE code = 'PRODUCT_VIEW';
UPDATE permissions SET code = 'PRODUCTS_CREATE' WHERE code = 'PRODUCT_CREATE';
UPDATE permissions SET code = 'PRODUCTS_EDIT'   WHERE code = 'PRODUCT_EDIT';
UPDATE permissions SET code = 'PRODUCTS_DELETE' WHERE code = 'PRODUCT_DELETE';
UPDATE permissions SET code = 'PRODUCTS_BLOCK'  WHERE code = 'PRODUCT_BLOCK';

-- Categories → reuse as PRODUCTS_* (CategoryController uses PRODUCTS_* authorities)
-- These become duplicates of PRODUCTS_*, so repurpose them for missing permissions
UPDATE permissions SET code = 'INVENTORY_VIEW'    WHERE code = 'CATEGORY_VIEW';
UPDATE permissions SET code = 'INVENTORY_ADJUST'  WHERE code = 'CATEGORY_CREATE';
UPDATE permissions SET code = 'ROLES_VIEW'        WHERE code = 'CATEGORY_EDIT';
UPDATE permissions SET code = 'ROLES_CREATE'      WHERE code = 'CATEGORY_DELETE';

-- Customers
UPDATE permissions SET code = 'CUSTOMERS_VIEW'   WHERE code = 'CUSTOMER_VIEW';
UPDATE permissions SET code = 'CUSTOMERS_CREATE' WHERE code = 'CUSTOMER_CREATE';
UPDATE permissions SET code = 'CUSTOMERS_EDIT'   WHERE code = 'CUSTOMER_EDIT';
UPDATE permissions SET code = 'CUSTOMERS_DELETE' WHERE code = 'CUSTOMER_DELETE';

-- Suppliers
UPDATE permissions SET code = 'SUPPLIERS_VIEW'   WHERE code = 'SUPPLIER_VIEW';
UPDATE permissions SET code = 'SUPPLIERS_CREATE' WHERE code = 'SUPPLIER_CREATE';
UPDATE permissions SET code = 'SUPPLIERS_EDIT'   WHERE code = 'SUPPLIER_EDIT';
UPDATE permissions SET code = 'SUPPLIERS_DELETE' WHERE code = 'SUPPLIER_DELETE';

-- Orders
UPDATE permissions SET code = 'ORDERS_VIEW'   WHERE code = 'ORDER_VIEW';
UPDATE permissions SET code = 'ORDERS_CREATE' WHERE code = 'ORDER_CREATE';
UPDATE permissions SET code = 'ORDERS_EDIT'   WHERE code = 'ORDER_EDIT';

-- Purchase Orders
UPDATE permissions SET code = 'PURCHASE_ORDERS_VIEW'   WHERE code = 'PURCHASE_ORDER_VIEW';
UPDATE permissions SET code = 'PURCHASE_ORDERS_CREATE' WHERE code = 'PURCHASE_ORDER_CREATE';
UPDATE permissions SET code = 'PURCHASE_ORDERS_EDIT'   WHERE code = 'PURCHASE_ORDER_EDIT';

-- Users
UPDATE permissions SET code = 'USERS_VIEW'   WHERE code = 'USER_VIEW';
UPDATE permissions SET code = 'USERS_CREATE' WHERE code = 'USER_CREATE';
UPDATE permissions SET code = 'USERS_EDIT'   WHERE code = 'USER_EDIT';
UPDATE permissions SET code = 'USERS_DELETE' WHERE code = 'USER_DELETE';
UPDATE permissions SET code = 'USERS_BLOCK'  WHERE code = 'USER_BLOCK';

-- Settings → repurpose for missing ROLES_EDIT
UPDATE permissions SET code = 'ROLES_EDIT'  WHERE code = 'SETTINGS_VIEW';

-- NOTIFICATION_VIEW, AUDIT_VIEW, AUDIT_CLEAR already match controllers

-- SETTINGS_EDIT is no longer used by controllers; keep as-is or repurpose
-- (not updating since no controller uses it and INVENTORY_ADJUST is covered)

-- Grant the renamed Gerencial role all permissions (role_permissions already points
-- to the same permission IDs, so no changes needed there — only the codes changed)
