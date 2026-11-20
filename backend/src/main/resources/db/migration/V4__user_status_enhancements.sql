-- V4: Add columns for suspension and soft-delete, update permission descriptions

ALTER TABLE users ADD COLUMN suspended_until DATETIME(6) NULL;
ALTER TABLE users ADD COLUMN deleted_at DATETIME(6) NULL;

UPDATE permissions SET description = 'Bloquear/Restringir/Suspender usuario'
    WHERE code = 'USERS_BLOCK';
UPDATE permissions SET description = 'Desactivar/Eliminar usuario'
    WHERE code = 'USERS_DELETE';
