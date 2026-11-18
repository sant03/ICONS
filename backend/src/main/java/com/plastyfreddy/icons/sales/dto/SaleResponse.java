package com.plastyfreddy.icons.sales.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record SaleResponse(
    Long id,
    String code,
    Long customerId,
    String customerName,
    LocalDate date,
    BigDecimal subtotal,
    BigDecimal total,
    BigDecimal amountPaid,
    BigDecimal amountDue,
    String paymentStatus,
    String status,
    String notes,
    List<SaleItemResponse> items,
    Instant createdAt,
    String createdBy
) {}
