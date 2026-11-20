package com.plastyfreddy.icons.auth;

import java.util.List;

public record AuthUserInfo(
    Long id,
    String username,
    String fullName,
    String email,
    String avatarUrl,
    String status,
    String tenantName,
    String tenantSlug,
    List<String> permissions
) {}
