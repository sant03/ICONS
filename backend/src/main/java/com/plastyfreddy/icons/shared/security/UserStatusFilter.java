package com.plastyfreddy.icons.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Component
public class UserStatusFilter extends OncePerRequestFilter {

    private static final Set<String> RESTRICTED_ALLOWED_PATHS = Set.of(
        "/auth/logout", "/auth/refresh", "/auth/logout-all", "/auth/profile"
    );

    private static final Set<String> WRITE_METHODS = Set.of(
        "POST", "PUT", "PATCH", "DELETE"
    );

    private final ObjectMapper objectMapper;

    public UserStatusFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userStatus = jwt.getClaimAsString("userStatus");
        if (userStatus == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String method = request.getMethod();
        String path = request.getServletPath();

        switch (userStatus) {
            case "DEACTIVATED" -> {
                sendError(response, 403, "Cuenta desactivada");
                return;
            }
            case "SUSPENDED" -> {
                sendError(response, 403, "Cuenta suspendida");
                return;
            }
            case "RESTRICTED" -> {
                if (WRITE_METHODS.contains(method) && !isRestrictedAllowed(path)) {
                    sendError(response, 403, "Su cuenta tiene acceso de solo lectura");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRestrictedAllowed(String path) {
        if (RESTRICTED_ALLOWED_PATHS.contains(path)) return true;
        // Allow own password change: POST /users/{id}/change-password
        return path.matches("/users/\\d+/change-password");
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(),
            Map.of("status", status, "detail", message));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/auth/login")
            || path.startsWith("/auth/register")
            || path.startsWith("/auth/roles")
            || path.startsWith("/auth/password-reset")
            || path.startsWith("/docs/")
            || path.startsWith("/actuator/");
    }
}
