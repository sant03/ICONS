package com.plastyfreddy.icons.dispatches.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDriverRequest(
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    String name,

    @Size(max = 20)
    String phone,

    @Size(max = 100)
    String vehicle,

    @Size(max = 20)
    String plate,

    @Size(max = 100)
    String zone
) {}
