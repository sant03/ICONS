package com.plastyfreddy.icons.purchases.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreatePurchaseItemRequest(
    @NotNull(message = "El producto es obligatorio")
    Long productId,

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    int quantity,

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio unitario debe ser mayor a 0")
    BigDecimal unitPrice
) {}
