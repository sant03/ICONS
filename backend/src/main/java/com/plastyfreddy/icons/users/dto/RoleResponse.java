package com.plastyfreddy.icons.users.dto;

import java.util.Set;

public record RoleResponse(
    Long id,
    String name,
    String description,
    boolean systemRole,
    Set<String> permissions
) {}
