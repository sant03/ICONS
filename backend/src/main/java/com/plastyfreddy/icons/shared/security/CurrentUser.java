package com.plastyfreddy.icons.shared.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;

public final class CurrentUser {

    private CurrentUser() {}

    public static Optional<Jwt> jwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return Optional.of(jwt);
        }
        return Optional.empty();
    }

    public static Long getUserId() {
        return jwt()
            .map(jwt -> Long.parseLong(jwt.getSubject()))
            .orElseThrow(() -> new IllegalStateException("No hay usuario autenticado"));
    }

    public static String getUsername() {
        return jwt()
            .map(jwt -> jwt.getClaimAsString("username"))
            .orElse("SYSTEM");
    }

    public static Long getTenantId() {
        return jwt()
            .map(jwt -> jwt.<Long>getClaim("tenantId"))
            .orElseThrow(() -> new IllegalStateException("No hay tenant en el token"));
    }
}
