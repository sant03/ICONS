package com.plastyfreddy.icons.customers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateCustomerRequest(
    @Size(max = 150)
    String name,

    @Size(max = 30)
    String docId,

    @Size(max = 20)
    String phone,

    @Email(message = "El email no es válido")
    @Size(max = 150)
    String email,

    @Size(max = 300)
    String address,

    @Size(max = 500)
    String avatarUrl
) {}
