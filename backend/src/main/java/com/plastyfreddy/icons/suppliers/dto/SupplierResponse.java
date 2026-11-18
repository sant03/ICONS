package com.plastyfreddy.icons.suppliers.dto;

import java.time.Instant;

public record SupplierResponse(
    Long id,
    String name,
    String code,
    String phone,
    String email,
    String address,
    String avatarUrl,
    Instant createdAt
) {}
