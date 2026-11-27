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
    String paymentStatus,
    int totalUnits,
    BigDecimal totalAmount,
    String itemsSummary,
    String comments,
    List<CustomerOrderItemResponse> items,
    List<Long> saleIds,
    Instant createdAt
) {}
