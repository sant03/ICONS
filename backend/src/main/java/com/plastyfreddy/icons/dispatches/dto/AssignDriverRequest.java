package com.plastyfreddy.icons.dispatches.dto;

import jakarta.validation.constraints.NotNull;

public record AssignDriverRequest(
    @NotNull(message = "El conductor es obligatorio")
    Long driverId
) {}
