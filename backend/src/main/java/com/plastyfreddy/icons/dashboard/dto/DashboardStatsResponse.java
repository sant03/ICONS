package com.plastyfreddy.icons.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
    SalesToday salesToday,
    StockAlert stockAlert,
    long pendingOrders,
    long newCustomersThisMonth,
    List<RecentTransaction> recentTransactions
) {

    public record SalesToday(
        BigDecimal total,
        long count
    ) {}

    public record StockAlert(
        long outOfStock,
        long lowStock
    ) {}

    public record RecentTransaction(
        String id,
        String module,
        String description,
        String status,
        BigDecimal amount,
        String date,
        String client
    ) {}
}
