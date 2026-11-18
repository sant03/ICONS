package com.plastyfreddy.icons.sales.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateSaleItemRequest(
    @NotNull(message = "El producto es obligatorio")
    Long productId,

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    int quantity
) {}
