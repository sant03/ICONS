package com.plastyfreddy.icons.users.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SuspendRequest(
    @NotNull
    @Pattern(regexp = "PT1H|PT24H|P7D|P30D", message = "Duración no válida")
    String duration
) {}
