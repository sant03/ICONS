package com.plastyfreddy.icons.users.dto;

import jakarta.validation.constraints.Size;

import java.util.Set;

public record UpdateRoleRequest(
    @Size(max = 80)
    String name,

    @Size(max = 255)
    String description,

    Set<String> permissions
) {}
