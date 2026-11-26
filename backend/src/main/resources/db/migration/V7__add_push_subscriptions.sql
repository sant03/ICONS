CREATE TABLE push_subscriptions (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    tenant_id  BIGINT       NOT NULL,
    user_id    BIGINT       NOT NULL,
    endpoint   VARCHAR(500) NOT NULL,
    p256dh     VARCHAR(200) NOT NULL,
    auth       VARCHAR(100) NOT NULL,
    user_agent VARCHAR(300),
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT uq_push_endpoint UNIQUE (tenant_id, endpoint),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_push_sub_user ON push_subscriptions(tenant_id, user_id);
