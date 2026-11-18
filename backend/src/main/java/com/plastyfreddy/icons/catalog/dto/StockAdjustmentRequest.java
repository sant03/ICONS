package com.plastyfreddy.icons.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StockAdjustmentRequest(
    @NotNull(message = "El tipo de ajuste es obligatorio")
    @NotBlank
    String type,

    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    int quantity,

    String notes
) {}
