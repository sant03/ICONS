package com.plastyfreddy.icons.auth;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    AuthUserInfo user
) {}
