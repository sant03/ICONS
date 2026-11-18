package com.plastyfreddy.icons.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateSaleRequest(
    Long customerId,

    @Size(max = 150)
    String customerName,

    @NotNull(message = "La fecha es obligatoria")
    LocalDate date,

    @NotEmpty(message = "La venta debe tener al menos un producto")
    @Valid
    List<CreateSaleItemRequest> items,

    @NotNull(message = "El monto pagado es obligatorio")
    @DecimalMin(value = "0.00")
    BigDecimal amountPaid,

    @Size(max = 500)
    String notes
) {}
