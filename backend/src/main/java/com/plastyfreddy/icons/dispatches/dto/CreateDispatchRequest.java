package com.plastyfreddy.icons.dispatches.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateDispatchRequest(
    Long orderId,

    @Size(max = 50)
    String orderNumber,

    @NotBlank(message = "El cliente es obligatorio")
    @Size(max = 150)
    String client,

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 300)
    String address,

    @Size(max = 20)
    String phone,

    @Size(max = 100)
    String zone,

    int units,

    BigDecimal totalAmount,

    Long driverId,

    String priority,

    @NotNull(message = "La fecha programada es obligatoria")
    LocalDate scheduledDate,

    @Size(max = 500)
    String notes
) {}
