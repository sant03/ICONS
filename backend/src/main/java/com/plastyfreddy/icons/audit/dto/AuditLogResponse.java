package com.plastyfreddy.icons.audit.dto;

import java.time.Instant;

public record AuditLogResponse(
    Long id,
    Long userId,
    String username,
    String action,
    String category,
    String entityType,
    Long entityId,
    String description,
    String ipAddress,
    Instant createdAt
) {}
