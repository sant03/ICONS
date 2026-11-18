package com.plastyfreddy.icons.notifications.dto;

import java.time.Instant;

public record NotificationResponse(
    Long id,
    String title,
    String description,
    String type,
    boolean read,
    String link,
    Instant createdAt
) {}
