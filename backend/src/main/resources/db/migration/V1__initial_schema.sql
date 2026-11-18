-- =============================================================================
-- ICONS v2 – Esquema inicial
-- Todas las tablas de negocio llevan tenant_id. Unicidad siempre por empresa.
-- Dinero: DECIMAL(12,2). IDs: BIGINT AUTO_INCREMENT. Timestamps: DATETIME(6).
-- =============================================================================

-- ----------------------------- Plataforma ------------------------------------

CREATE TABLE tenants (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(50)     NOT NULL UNIQUE,
    name            VARCHAR(150)    NOT NULL,
    nit             VARCHAR(30),
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    currency        VARCHAR(3)      NOT NULL DEFAULT 'COP',
    tax_rate        DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    logo_url        VARCHAR(500),
    alert_threshold INT             NOT NULL DEFAULT 10,
    mail_from       VARCHAR(150),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE platform_admins (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(150)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- RBAC ------------------------------------------

CREATE TABLE roles (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(80)     NOT NULL,
    description     VARCHAR(255),
    is_system_role  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6),
    UNIQUE (tenant_id, name),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(80)     NOT NULL UNIQUE,
    description     VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id         BIGINT          NOT NULL,
    permission_id   BIGINT          NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Usuarios --------------------------------------

CREATE TABLE users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    username        VARCHAR(50)     NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(150)    NOT NULL,
    doc_id          VARCHAR(30),
    date_of_birth   DATE,
    phone           VARCHAR(20),
    landline        VARCHAR(20),
    position_name   VARCHAR(100),
    avatar_url      VARCHAR(500),
    role_id         BIGINT          NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    failed_attempts INT             NOT NULL DEFAULT 0,
    locked_until    DATETIME(6),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    UNIQUE (tenant_id, username),
    UNIQUE (tenant_id, email),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (role_id)   REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL UNIQUE,
    expires_at      DATETIME(6)     NOT NULL,
    revoked         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_resets (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    code_hash       VARCHAR(255)    NOT NULL,
    used            BOOLEAN         NOT NULL DEFAULT FALSE,
    expires_at      DATETIME(6)     NOT NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Catálogo --------------------------------------

CREATE TABLE categories (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    deleted_at      DATETIME(6),
    UNIQUE (tenant_id, name),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    code            VARCHAR(50)     NOT NULL,
    reference       VARCHAR(150)    NOT NULL,
    category_id     BIGINT          NOT NULL,
    stock           INT             NOT NULL DEFAULT 0,
    min_purchase    INT             NOT NULL DEFAULT 0,
    purchase_price  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    sale_price      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    unit            VARCHAR(10)     NOT NULL DEFAULT 'Und',
    image_url       VARCHAR(500),
    blocked         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    deleted_at      DATETIME(6),
    UNIQUE (tenant_id, code),
    UNIQUE (tenant_id, reference),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (category_id)   REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Inventario (Kardex) ---------------------------

CREATE TABLE stock_movements (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    type            VARCHAR(20)     NOT NULL,
    quantity        INT             NOT NULL,
    stock_after     INT             NOT NULL,
    reference_type  VARCHAR(30),
    reference_id    BIGINT,
    notes           VARCHAR(500),
    created_by      VARCHAR(100)    NOT NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (product_id)    REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_stock_movements_product ON stock_movements(tenant_id, product_id, created_at);

-- ----------------------------- Terceros --------------------------------------

CREATE TABLE customers (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    doc_id          VARCHAR(30),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         VARCHAR(300),
    avatar_url      VARCHAR(500),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    deleted_at      DATETIME(6),
    UNIQUE (tenant_id, doc_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suppliers (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    code            VARCHAR(50)     NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         VARCHAR(300),
    avatar_url      VARCHAR(500),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    deleted_at      DATETIME(6),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Ventas ----------------------------------------

CREATE TABLE sales (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    code            VARCHAR(20)     NOT NULL,
    customer_id     BIGINT,
    customer_name   VARCHAR(150),
    date            DATE            NOT NULL,
    subtotal        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    amount_paid     DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    amount_due      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    payment_status  VARCHAR(20)     NOT NULL DEFAULT 'NO_PAGADO',
    status          VARCHAR(20)     NOT NULL DEFAULT 'COMPLETED',
    notes           VARCHAR(500),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    cancelled_at    DATETIME(6),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (customer_id)   REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sale_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    sale_id         BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(150)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(12,2)   NOT NULL,
    total           DECIMAL(12,2)   NOT NULL,
    FOREIGN KEY (sale_id)       REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)    REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Pedidos (Customer Orders) ---------------------

CREATE TABLE customer_orders (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    code            VARCHAR(20)     NOT NULL,
    customer_id     BIGINT,
    customer_name   VARCHAR(150),
    date            DATE            NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    total_units     INT             NOT NULL DEFAULT 0,
    total_amount    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    items_summary   VARCHAR(500),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (customer_id)   REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customer_order_sales (
    order_id        BIGINT          NOT NULL,
    sale_id         BIGINT          NOT NULL,
    PRIMARY KEY (order_id, sale_id),
    FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id)  REFERENCES sales(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Compras ---------------------------------------

CREATE TABLE purchases (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    code            VARCHAR(20)     NOT NULL,
    supplier_id     BIGINT,
    supplier_name   VARCHAR(150),
    date            DATE            NOT NULL,
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    status          VARCHAR(20)     NOT NULL DEFAULT 'COMPLETED',
    notes           VARCHAR(500),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    cancelled_at    DATETIME(6),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (supplier_id)   REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    purchase_id     BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(150)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(12,2)   NOT NULL,
    total           DECIMAL(12,2)   NOT NULL,
    FOREIGN KEY (purchase_id)   REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)    REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Órdenes de Compra -----------------------------

CREATE TABLE purchase_orders (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    code            VARCHAR(20)     NOT NULL,
    supplier_id     BIGINT,
    supplier_name   VARCHAR(150),
    supplier_address VARCHAR(300),
    supplier_phone  VARCHAR(20),
    supplier_email  VARCHAR(150),
    date            DATE            NOT NULL,
    made_on         DATE            NOT NULL,
    reception_date  DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'DISPONIBLE',
    made_by         VARCHAR(150)    NOT NULL,
    user_username   VARCHAR(50)     NOT NULL,
    area            VARCHAR(100),
    payment_method  VARCHAR(100),
    total_products  INT             NOT NULL DEFAULT 0,
    total           DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    approved_by     VARCHAR(150),
    scheduled_date  DATE,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_by      VARCHAR(100)    NOT NULL DEFAULT 'SYSTEM',
    updated_at      DATETIME(6),
    updated_by      VARCHAR(100),
    UNIQUE (tenant_id, code),
    FOREIGN KEY (tenant_id)     REFERENCES tenants(id),
    FOREIGN KEY (supplier_id)   REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_order_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT        NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(150)    NOT NULL,
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(12,2)   NOT NULL,
    total           DECIMAL(12,2)   NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)        REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- Notificaciones --------------------------------

CREATE TABLE notifications (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    user_id         BIGINT,
    title           VARCHAR(200)    NOT NULL,
    description     VARCHAR(500)    NOT NULL,
    type            VARCHAR(30)     NOT NULL,
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    link            VARCHAR(100),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_user ON notifications(tenant_id, user_id, is_read, created_at DESC);

-- ----------------------------- Auditoría -------------------------------------

CREATE TABLE audit_log (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    user_id         BIGINT,
    username        VARCHAR(50),
    action          VARCHAR(50)     NOT NULL,
    category        VARCHAR(30)     NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    description     VARCHAR(500)    NOT NULL,
    ip_address      VARCHAR(45),
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_log_tenant_date ON audit_log(tenant_id, created_at DESC);

-- ----------------------------- Secuencias ------------------------------------

CREATE TABLE sequences (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    tenant_id       BIGINT          NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    prefix          VARCHAR(10)     NOT NULL,
    next_value      BIGINT          NOT NULL DEFAULT 1,
    padding         INT             NOT NULL DEFAULT 6,
    UNIQUE (tenant_id, name),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------- ShedLock --------------------------------------

CREATE TABLE shedlock (
    name            VARCHAR(64)     NOT NULL PRIMARY KEY,
    lock_until      TIMESTAMP(3)    NOT NULL,
    locked_at       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    locked_by       VARCHAR(255)    NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================= Datos Seed ====================================

-- Tenant #1: PlastyFreddy
INSERT INTO tenants (id, slug, name, nit, status, currency, tax_rate)
VALUES (1, 'plastyfreddy', 'PlastyFreddy', '900123456-1', 'ACTIVE', 'COP', 19.00);

-- Permisos del sistema
INSERT INTO permissions (id, code, description) VALUES
    (1,  'DASHBOARD_VIEW',         'Ver dashboard'),
    (2,  'SALE_VIEW',              'Ver ventas'),
    (3,  'SALE_CREATE',            'Crear venta'),
    (4,  'SALE_EDIT',              'Editar venta'),
    (5,  'SALE_DELETE',            'Eliminar/anular venta'),
    (6,  'PURCHASE_VIEW',          'Ver compras'),
    (7,  'PURCHASE_CREATE',        'Crear compra'),
    (8,  'PURCHASE_EDIT',          'Editar compra'),
    (9,  'PURCHASE_DELETE',        'Eliminar/anular compra'),
    (10, 'PRODUCT_VIEW',           'Ver productos'),
    (11, 'PRODUCT_CREATE',         'Crear producto'),
    (12, 'PRODUCT_EDIT',           'Editar producto'),
    (13, 'PRODUCT_DELETE',         'Eliminar producto'),
    (14, 'PRODUCT_BLOCK',          'Bloquear/desbloquear producto'),
    (15, 'CATEGORY_VIEW',          'Ver categorías'),
    (16, 'CATEGORY_CREATE',        'Crear categoría'),
    (17, 'CATEGORY_EDIT',          'Editar categoría'),
    (18, 'CATEGORY_DELETE',        'Eliminar categoría'),
    (19, 'CUSTOMER_VIEW',          'Ver clientes'),
    (20, 'CUSTOMER_CREATE',        'Crear cliente'),
    (21, 'CUSTOMER_EDIT',          'Editar cliente'),
    (22, 'CUSTOMER_DELETE',        'Eliminar cliente'),
    (23, 'SUPPLIER_VIEW',          'Ver proveedores'),
    (24, 'SUPPLIER_CREATE',        'Crear proveedor'),
    (25, 'SUPPLIER_EDIT',          'Editar proveedor'),
    (26, 'SUPPLIER_DELETE',        'Eliminar proveedor'),
    (27, 'ORDER_VIEW',             'Ver pedidos'),
    (28, 'ORDER_CREATE',           'Crear pedido'),
    (29, 'ORDER_EDIT',             'Editar pedido'),
    (30, 'PURCHASE_ORDER_VIEW',    'Ver órdenes de compra'),
    (31, 'PURCHASE_ORDER_CREATE',  'Crear orden de compra'),
    (32, 'PURCHASE_ORDER_EDIT',    'Editar orden de compra'),
    (33, 'PURCHASE_ORDER_DELETE',  'Eliminar orden de compra'),
    (34, 'USER_VIEW',              'Ver usuarios'),
    (35, 'USER_CREATE',            'Crear usuario'),
    (36, 'USER_EDIT',              'Editar usuario'),
    (37, 'USER_DELETE',            'Eliminar usuario'),
    (38, 'USER_BLOCK',             'Bloquear/suspender usuario'),
    (39, 'NOTIFICATION_VIEW',      'Ver notificaciones'),
    (40, 'AUDIT_VIEW',             'Ver historial de actividad'),
    (41, 'AUDIT_CLEAR',            'Limpiar historial de actividad'),
    (42, 'SETTINGS_VIEW',          'Ver configuración'),
    (43, 'SETTINGS_EDIT',          'Editar configuración');

-- Roles base para PlastyFreddy (tenant #1)
INSERT INTO roles (id, tenant_id, name, description, is_system_role) VALUES
    (1, 1, 'Gerencial',      'Acceso total: todas las funciones operativas y administrativas', TRUE),
    (2, 1, 'Administrativo', 'Funciones administrativas: usuarios, órdenes, eliminaciones',    TRUE),
    (3, 1, 'Auxiliar',       'Solo funciones operativas: registrar ventas, compras, productos', TRUE);

-- Gerencial: todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Administrativo: todo menos bloquear productos y limpiar auditoría
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code NOT IN ('PRODUCT_BLOCK', 'AUDIT_CLEAR', 'SETTINGS_EDIT');

-- Auxiliar: solo operaciones básicas (ver + crear ventas/compras/productos/clientes/proveedores)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN (
    'DASHBOARD_VIEW',
    'SALE_VIEW', 'SALE_CREATE',
    'PURCHASE_VIEW', 'PURCHASE_CREATE',
    'PRODUCT_VIEW', 'PRODUCT_CREATE',
    'CATEGORY_VIEW',
    'CUSTOMER_VIEW', 'CUSTOMER_CREATE',
    'SUPPLIER_VIEW', 'SUPPLIER_CREATE',
    'ORDER_VIEW',
    'PURCHASE_ORDER_VIEW',
    'NOTIFICATION_VIEW'
);

-- Secuencias para PlastyFreddy
INSERT INTO sequences (tenant_id, name, prefix, next_value, padding) VALUES
    (1, 'SALE',           'V-',  1, 6),
    (1, 'PURCHASE',       'C-',  1, 6),
    (1, 'CUSTOMER_ORDER', 'P-',  1, 6),
    (1, 'PURCHASE_ORDER', 'OC-', 1, 3),
    (1, 'PRODUCT',        'PR-', 1, 6);
