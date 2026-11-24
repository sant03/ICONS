package com.plastyfreddy.icons.dispatches.dto;

import jakarta.validation.constraints.Size;

public record UpdateDriverRequest(
    @Size(max = 150)
    String name,

    @Size(max = 20)
    String phone,

    @Size(max = 100)
    String vehicle,

    @Size(max = 20)
    String plate,

    @Size(max = 100)
    String zone,

    String status
) {}
