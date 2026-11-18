package com.plastyfreddy.icons.catalog.dto;

import java.time.Instant;

public record StockMovementResponse(
    Long id,
    String type,
    int quantity,
    int stockAfter,
    String referenceType,
    Long referenceId,
    String notes,
    String createdBy,
    Instant createdAt
) {}
