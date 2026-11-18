package com.plastyfreddy.icons.users.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateUserRequest(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
    String username,

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    String email,

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String password,

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(max = 150)
    String fullName,

    String docId,
    LocalDate dateOfBirth,
    String phone,
    String landline,
    String positionName,

    @NotNull(message = "El rol es obligatorio")
    Long roleId
) {}
