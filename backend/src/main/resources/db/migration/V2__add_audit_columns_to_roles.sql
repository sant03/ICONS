ALTER TABLE roles
    ADD COLUMN created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM' AFTER created_at,
    ADD COLUMN updated_by VARCHAR(100) AFTER updated_at;
