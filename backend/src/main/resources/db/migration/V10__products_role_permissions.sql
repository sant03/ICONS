-- =============================================================================
-- V10 – Ajuste de permisos de productos por rol
-- =============================================================================

-- Auxiliar: puede editar y eliminar productos (ya tiene PRODUCTS_VIEW y PRODUCTS_CREATE)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'PRODUCTS_EDIT';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'PRODUCTS_DELETE';

-- Delivery: puede ver productos (solo lectura)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'PRODUCTS_VIEW';
