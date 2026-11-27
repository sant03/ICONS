-- =============================================================================
-- V11 – Ajuste de permisos de clientes y proveedores por rol
-- =============================================================================

-- Auxiliar: puede editar y eliminar clientes (ya tiene CUSTOMERS_VIEW y CUSTOMERS_CREATE)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'CUSTOMERS_EDIT';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'CUSTOMERS_DELETE';

-- Auxiliar: puede editar y eliminar proveedores (ya tiene SUPPLIERS_VIEW y SUPPLIERS_CREATE)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'SUPPLIERS_EDIT';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'SUPPLIERS_DELETE';

-- Delivery: puede ver clientes y proveedores (solo lectura)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'CUSTOMERS_VIEW';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'SUPPLIERS_VIEW';
