package com.plastyfreddy.icons.purchases.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PurchaseResponse(
    Long id,
    String code,
    Long supplierId,
    String supplierName,
    LocalDate date,
    BigDecimal total,
    String status,
    String notes,
    List<PurchaseItemResponse> items,
    Instant createdAt,
    String createdBy
) {}
