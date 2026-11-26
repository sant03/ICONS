package com.plastyfreddy.icons.notifications.dto;

import jakarta.validation.constraints.NotBlank;

public record PushUnsubscribeRequest(
    @NotBlank String endpoint
) {}
