package com.plastyfreddy.icons.auth;

public record AuthUserInfo(
    Long id,
    String username,
    String fullName,
    String email,
    String avatarUrl,
    String status,
    String tenantName,
    String tenantSlug
) {}
