package com.plastyfreddy.icons.purchases.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseRequest(
    Long supplierId,

    @Size(max = 150)
    String supplierName,

    @NotNull(message = "La fecha es obligatoria")
    LocalDate date,

    @NotEmpty(message = "La compra debe tener al menos un producto")
    @Valid
    List<CreatePurchaseItemRequest> items,

    @Size(max = 500)
    String notes
) {}
