package com.plastyfreddy.icons.purchases.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseOrderRequest(
    Long supplierId,

    @Size(max = 150)
    String supplierName,

    @Size(max = 300)
    String supplierAddress,

    @Size(max = 20)
    String supplierPhone,

    @Size(max = 150)
    String supplierEmail,

    @NotNull(message = "La fecha es obligatoria")
    LocalDate date,

    @NotNull(message = "La fecha de elaboración es obligatoria")
    LocalDate madeOn,

    LocalDate receptionDate,

    @NotBlank(message = "El campo 'elaborado por' es obligatorio")
    @Size(max = 150)
    String madeBy,

    @Size(max = 100)
    String area,

    @Size(max = 100)
    String paymentMethod,

    @Size(max = 150)
    String approvedBy,

    LocalDate scheduledDate,

    @NotEmpty(message = "La orden debe tener al menos un producto")
    @Valid
    List<CreatePurchaseOrderItemRequest> items
) {}
