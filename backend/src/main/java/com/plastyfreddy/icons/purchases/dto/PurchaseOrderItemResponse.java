package com.plastyfreddy.icons.purchases.dto;

import java.math.BigDecimal;

public record PurchaseOrderItemResponse(
    Long id,
    Long productId,
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal total
) {}
