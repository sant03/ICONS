package com.plastyfreddy.icons.dispatches.dto;

import java.time.Instant;

public record DispatchHistoryResponse(
    Long id,
    Instant timestamp,
    String event,
    String actor
) {}
