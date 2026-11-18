package com.plastyfreddy.icons.catalog.dto;

import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(
    @Size(max = 100)
    String name
) {}
