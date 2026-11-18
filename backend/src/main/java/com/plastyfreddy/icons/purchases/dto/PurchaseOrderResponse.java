package com.plastyfreddy.icons.purchases.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderResponse(
    Long id,
    String code,
    Long supplierId,
    String supplierName,
    String supplierAddress,
    String supplierPhone,
    String supplierEmail,
    LocalDate date,
    LocalDate madeOn,
    LocalDate receptionDate,
    String status,
    String madeBy,
    String userUsername,
    String area,
    String paymentMethod,
    int totalProducts,
    BigDecimal total,
    String approvedBy,
    LocalDate scheduledDate,
    List<PurchaseOrderItemResponse> items,
    Instant createdAt
) {}
