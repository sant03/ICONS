-- V12: Add payment status, comments, and line items to customer orders

ALTER TABLE customer_orders
    ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'Pagado' AFTER status,
    ADD COLUMN comments VARCHAR(500) NULL AFTER items_summary;

CREATE TABLE customer_order_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    product_id      BIGINT          NOT NULL,
    product_name    VARCHAR(150)    NOT NULL,
    product_code    VARCHAR(50),
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(12,2)   NOT NULL,
    total           DECIMAL(12,2)   NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES customer_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
