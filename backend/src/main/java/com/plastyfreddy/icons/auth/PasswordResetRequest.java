package com.plastyfreddy.icons.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordResetRequest(
    @NotBlank(message = "El código de empresa es obligatorio")
    String tenant,

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    String email
) {}
