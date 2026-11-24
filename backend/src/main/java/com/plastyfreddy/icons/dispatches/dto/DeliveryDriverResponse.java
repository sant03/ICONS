package com.plastyfreddy.icons.dispatches.dto;

import java.time.Instant;

public record DeliveryDriverResponse(
    Long id,
    String name,
    String phone,
    String vehicle,
    String plate,
    String zone,
    String status,
    String avatarInitials,
    Instant createdAt
) {}
