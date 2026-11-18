package com.plastyfreddy.icons.dashboard;

import com.plastyfreddy.icons.dashboard.dto.DashboardStatsResponse;
import com.plastyfreddy.icons.dashboard.dto.DashboardStatsResponse.*;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        Long tenantId = TenantContext.require();
        LocalDate today = LocalDate.now();

        SalesToday salesToday = getSalesToday(tenantId, today);
        StockAlert stockAlert = getStockAlert(tenantId);
        long pendingOrders = getPendingOrders(tenantId);
        long newCustomers = getNewCustomersThisMonth(tenantId, today);
        List<RecentTransaction> transactions = getRecentTransactions(tenantId);

        return new DashboardStatsResponse(
            salesToday, stockAlert, pendingOrders, newCustomers, transactions
        );
    }

    private SalesToday getSalesToday(Long tenantId, LocalDate today) {
        return jdbc.queryForObject(
            """
            SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cnt
            FROM sales
            WHERE tenant_id = ? AND DATE(date) = ? AND cancelled_at IS NULL
            """,
            (rs, rowNum) -> new SalesToday(
                rs.getBigDecimal("total"),
                rs.getLong("cnt")
            ),
            tenantId, today
        );
    }

    private StockAlert getStockAlert(Long tenantId) {
        return jdbc.queryForObject(
            """
            SELECT
              COUNT(CASE WHEN stock = 0 AND blocked = FALSE THEN 1 END) AS out_of_stock,
              COUNT(CASE WHEN stock > 0 AND stock <= min_purchase AND blocked = FALSE THEN 1 END) AS low_stock
            FROM products
            WHERE tenant_id = ? AND deleted_at IS NULL
            """,
            (rs, rowNum) -> new StockAlert(
                rs.getLong("out_of_stock"),
                rs.getLong("low_stock")
            ),
            tenantId
        );
    }

    private long getPendingOrders(Long tenantId) {
        Long count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM customer_orders WHERE tenant_id = ? AND status = 'PENDING'",
            Long.class,
            tenantId
        );
        return count != null ? count : 0;
    }

    private long getNewCustomersThisMonth(Long tenantId, LocalDate today) {
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        Long count = jdbc.queryForObject(
            """
            SELECT COUNT(*) FROM customers
            WHERE tenant_id = ? AND deleted_at IS NULL AND DATE(created_at) >= ?
            """,
            Long.class,
            tenantId, firstOfMonth
        );
        return count != null ? count : 0;
    }

    private List<RecentTransaction> getRecentTransactions(Long tenantId) {
        List<RecentTransaction> sales = jdbc.query(
            """
            SELECT code, 'Ventas' AS module, CONCAT('Venta a ', customer_name) AS description,
                   CASE WHEN cancelled_at IS NOT NULL THEN 'Cancelado'
                        WHEN payment_status = 'PAGADO' THEN 'Completado'
                        ELSE 'Pendiente' END AS status,
                   total, DATE(date) AS tx_date, customer_name
            FROM sales WHERE tenant_id = ?
            ORDER BY created_at DESC LIMIT 5
            """,
            (rs, rowNum) -> new RecentTransaction(
                rs.getString("code"), rs.getString("module"),
                rs.getString("description"), rs.getString("status"),
                rs.getBigDecimal("total"), rs.getString("tx_date"),
                rs.getString("customer_name")
            ),
            tenantId
        );

        List<RecentTransaction> purchases = jdbc.query(
            """
            SELECT code, 'Compras' AS module, CONCAT('Compra a ', supplier_name) AS description,
                   CASE WHEN cancelled_at IS NOT NULL THEN 'Cancelado' ELSE 'Completado' END AS status,
                   total, DATE(date) AS tx_date, supplier_name AS client
            FROM purchases WHERE tenant_id = ?
            ORDER BY created_at DESC LIMIT 5
            """,
            (rs, rowNum) -> new RecentTransaction(
                rs.getString("code"), rs.getString("module"),
                rs.getString("description"), rs.getString("status"),
                rs.getBigDecimal("total"), rs.getString("tx_date"),
                rs.getString("client")
            ),
            tenantId
        );

        var all = new java.util.ArrayList<>(sales);
        all.addAll(purchases);
        all.sort((a, b) -> b.date().compareTo(a.date()));
        return all.size() > 10 ? all.subList(0, 10) : all;
    }
}
