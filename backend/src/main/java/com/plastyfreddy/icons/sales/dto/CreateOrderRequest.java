package com.plastyfreddy.icons.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateOrderRequest(
    Long customerId,

    @Size(max = 150)
    String customerName,

    @NotNull(message = "La fecha es obligatoria")
    LocalDate date,

    @Size(max = 20)
    String paymentStatus,

    @Size(max = 500)
    String comments,

    @Size(max = 500)
    String itemsSummary,

    @Valid
    List<CreateOrderItemRequest> items
) {}
