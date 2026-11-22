package com.plastyfreddy.icons.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProductRequest(
    @Size(max = 150)
    String reference,

    Long categoryId,

    @Min(value = 0, message = "El stock no puede ser negativo")
    Integer stock,

    @Min(value = 0, message = "El stock mínimo de compra no puede ser negativo")
    Integer minPurchase,

    @DecimalMin(value = "0.00", message = "El precio de compra no puede ser negativo")
    BigDecimal purchasePrice,

    @DecimalMin(value = "0.00", message = "El precio de venta no puede ser negativo")
    BigDecimal salePrice,

    @Size(max = 10)
    String unit,

    Boolean blocked
) {}
