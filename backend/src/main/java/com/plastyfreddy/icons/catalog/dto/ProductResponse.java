package com.plastyfreddy.icons.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
    Long id,
    String code,
    String reference,
    Long categoryId,
    String categoryName,
    int stock,
    int minPurchase,
    BigDecimal purchasePrice,
    BigDecimal salePrice,
    String unit,
    String imageUrl,
    boolean blocked,
    String status,
    Instant createdAt
) {}
