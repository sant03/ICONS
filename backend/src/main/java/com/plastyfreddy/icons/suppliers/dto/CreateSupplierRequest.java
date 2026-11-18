package com.plastyfreddy.icons.suppliers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupplierRequest(
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Size(max = 150)
    String name,

    @Size(max = 20)
    String phone,

    @Email(message = "El email no es válido")
    @Size(max = 150)
    String email,

    @Size(max = 300)
    String address
) {}
