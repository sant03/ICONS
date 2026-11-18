package com.plastyfreddy.icons.sales.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CustomerOrderResponse(
    Long id,
    String code,
    Long customerId,
    String customerName,
    LocalDate date,
    String status,
    int totalUnits,
    BigDecimal totalAmount,
    String itemsSummary,
    List<Long> saleIds,
    Instant createdAt
) {}
