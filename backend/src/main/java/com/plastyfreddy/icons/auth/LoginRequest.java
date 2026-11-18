package com.plastyfreddy.icons.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El código de empresa es obligatorio")
    String tenant,

    @NotBlank(message = "El nombre de usuario es obligatorio")
    String username,

    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {}
