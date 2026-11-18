package com.plastyfreddy.icons.users.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateRoleRequest(
    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 80)
    String name,

    @Size(max = 255)
    String description,

    Set<String> permissions
) {}
