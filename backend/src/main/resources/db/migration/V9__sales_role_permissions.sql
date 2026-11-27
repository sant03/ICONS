-- =============================================================================
-- V9 – Ajuste de permisos de ventas por rol
-- =============================================================================

-- Auxiliar: puede editar y cancelar ventas (ya tiene SALES_VIEW y SALES_CREATE)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'SALES_EDIT';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'SALES_CANCEL';

-- Delivery: puede ver ventas (solo lectura)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'SALES_VIEW';
