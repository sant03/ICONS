package com.plastyfreddy.icons.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100)
    String name
) {}
