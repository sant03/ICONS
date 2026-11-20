package com.plastyfreddy.icons.auth;

import java.time.Instant;
import java.time.LocalDate;

public record ProfileResponse(
    Long id,
    String username,
    String fullName,
    String email,
    String docId,
    LocalDate dateOfBirth,
    String phone,
    String landline,
    String positionName,
    String avatarUrl,
    String roleName,
    String status,
    Instant createdAt,
    String tenantName
) {}
