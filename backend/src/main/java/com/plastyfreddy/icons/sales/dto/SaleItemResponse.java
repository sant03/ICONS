package com.plastyfreddy.icons.sales.dto;

import java.math.BigDecimal;

public record SaleItemResponse(
    Long id,
    Long productId,
    String productName,
    int quantity,
    BigDecimal unitPrice,
    BigDecimal total
) {}
