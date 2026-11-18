package com.plastyfreddy.icons.users.dto;

import java.time.Instant;
import java.time.LocalDate;

public record UserResponse(
    Long id,
    String username,
    String email,
    String fullName,
    String docId,
    LocalDate dateOfBirth,
    String phone,
    String landline,
    String positionName,
    String avatarUrl,
    Long roleId,
    String roleName,
    String status,
    int failedAttempts,
    Instant lockedUntil,
    Instant createdAt,
    String createdBy
) {}
