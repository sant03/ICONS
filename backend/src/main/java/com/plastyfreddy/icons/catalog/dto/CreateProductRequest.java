package com.plastyfreddy.icons.catalog.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProductRequest(
    @NotBlank(message = "La referencia del producto es obligatoria")
    @Size(max = 150)
    String reference,

    @NotNull(message = "La categoría es obligatoria")
    Long categoryId,

    @Min(value = 0, message = "El stock inicial no puede ser negativo")
    int stock,

    @Min(value = 0, message = "El stock mínimo de compra no puede ser negativo")
    int minPurchase,

    @NotNull(message = "El precio de compra es obligatorio")
    @DecimalMin(value = "0.00", message = "El precio de compra no puede ser negativo")
    BigDecimal purchasePrice,

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.00", message = "El precio de venta no puede ser negativo")
    BigDecimal salePrice,

    @Size(max = 10)
    String unit
) {}
