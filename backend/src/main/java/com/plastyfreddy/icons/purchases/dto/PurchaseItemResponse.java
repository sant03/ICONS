package com.plastyfreddy.icons.purchases.dto;

import java.math.BigDecimal;

public record PurchaseItemResponse(
    Long id,
    Long productId,
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal total
) {}
