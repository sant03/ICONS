package com.plastyfreddy.icons.customers.dto;

import java.time.Instant;

public record CustomerResponse(
    Long id,
    String name,
    String docId,
    String phone,
    String email,
    String address,
    String avatarUrl,
    Instant createdAt
) {}
