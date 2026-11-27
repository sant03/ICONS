package com.plastyfreddy.icons.sales.dto;

import java.math.BigDecimal;

public record CustomerOrderItemResponse(
    Long id,
    Long productId,
    String productName,
    String productCode,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal total
) {}
