package com.plastyfreddy.icons.dispatches.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DispatchResponse(
    Long id,
    String code,
    Long orderId,
    String orderNumber,
    String client,
    String address,
    String phone,
    String zone,
    int units,
    BigDecimal totalAmount,
    Long driverId,
    String driverName,
    String status,
    String priority,
    LocalDate scheduledDate,
    Instant assignedAt,
    String rejectedByDriverName,
    String rejectionReason,
    String notes,
    List<DispatchHistoryResponse> history,
    Instant createdAt
) {}
