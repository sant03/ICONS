-- =============================================================================
-- V8 – Ajuste de permisos de usuario por rol
-- =============================================================================

-- Auxiliar: puede ver usuarios
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code = 'USERS_VIEW';

-- Delivery: puede ver usuarios
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'USERS_VIEW';

-- Administrativo: NO puede desactivar cuentas
DELETE FROM role_permissions
WHERE role_id = 2
  AND permission_id = (SELECT id FROM permissions WHERE code = 'USERS_DELETE');
