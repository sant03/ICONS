-- =============================================================================
-- V6 – Módulo de Despachos: conductores, despachos, historial, rol Delivery
-- =============================================================================

-- ----------------------------- Conductores ----------------------------------

CREATE TABLE delivery_drivers (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    phone           VARCHAR(20),
    vehicle         VARCHAR(100),
    plate           VARCHAR(20),
    zone            VARCHAR(100),
    status          VARCHAR(20)     NOT NULL DEFAULT 'DISPONIBLE',
    avatar_initials VARCHAR(5),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Despachos ------------------------------------

CREATE TABLE dispatches (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id           BIGINT          NOT NULL,
    code                VARCHAR(20)     NOT NULL,
    order_id            BIGINT,
    order_number        VARCHAR(50),
    client              VARCHAR(150)    NOT NULL,
    address             VARCHAR(300)    NOT NULL,
    phone               VARCHAR(20),
    zone                VARCHAR(100),
    units               INT             NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    driver_id           BIGINT,
    status              VARCHAR(20)     NOT NULL DEFAULT 'POR_ASIGNAR',
    priority            VARCHAR(20)     NOT NULL DEFAULT 'NORMAL',
    scheduled_date      DATE            NOT NULL,
    assigned_at         DATETIME(6),
    rejected_by_driver  VARCHAR(150),
    rejection_reason    VARCHAR(500),
    notes               VARCHAR(500),
    created_at          DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by          VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at          DATETIME(6),
    updated_by          VARCHAR(100),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (order_id)  REFERENCES customer_orders(id),
    FOREIGN KEY (driver_id) REFERENCES delivery_drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_dispatches_tenant_status ON dispatches(tenant_id, status, scheduled_date DESC);

-- ----------------------------- Historial de despacho ------------------------

CREATE TABLE dispatch_history (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    dispatch_id     BIGINT          NOT NULL,
    timestamp       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    event           VARCHAR(300)    NOT NULL,
    actor           VARCHAR(150)    NOT NULL,
    FOREIGN KEY (dispatch_id) REFERENCES dispatches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Permisos de despacho -------------------------

INSERT INTO permissions (id, code, description) VALUES
    (44, 'DISPATCH_VIEW',    'Ver despachos'),
    (45, 'DISPATCH_CREATE',  'Crear despacho'),
    (46, 'DISPATCH_EDIT',    'Editar despacho'),
    (47, 'DISPATCH_DELETE',  'Eliminar despacho'),
    (48, 'DRIVER_VIEW',      'Ver conductores'),
    (49, 'DRIVER_CREATE',    'Crear conductor'),
    (50, 'DRIVER_EDIT',      'Editar conductor'),
    (51, 'DRIVER_DELETE',    'Eliminar conductor');

-- Gerencial: todos los permisos nuevos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE id BETWEEN 44 AND 51;

-- Administrativo: todos los permisos nuevos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE id BETWEEN 44 AND 51;

-- Auxiliar: solo ver
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN ('DISPATCH_VIEW', 'DRIVER_VIEW');

-- ----------------------------- Rol Delivery ---------------------------------

INSERT INTO roles (id, tenant_id, name, description, is_system_role)
VALUES (4, 1, 'Delivery', 'Conductores de despacho: ver y gestionar entregas asignadas', TRUE);

INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN (
    'DASHBOARD_VIEW',
    'DISPATCH_VIEW', 'DISPATCH_EDIT',
    'DRIVER_VIEW',
    'ORDER_VIEW',
    'NOTIFICATION_VIEW'
);

-- Secuencia de despachos
INSERT INTO sequences (tenant_id, name, prefix, next_value, padding) VALUES
    (1, 'DISPATCH', 'DSP-', 1, 3);
