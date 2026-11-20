package com.plastyfreddy.icons.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration accessTokenExpiration;
    private final Duration refreshTokenExpiration;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtService(
        @Value("${icons.security.jwt.secret}") String secret,
        @Value("${icons.security.jwt.access-token-expiration}") Duration accessTokenExpiration,
        @Value("${icons.security.jwt.refresh-token-expiration}") Duration refreshTokenExpiration
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(Long userId, String username, Long tenantId,
                                       Collection<String> permissions, String userStatus) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId.toString())
            .claim("username", username)
            .claim("tenantId", tenantId)
            .claim("permissions", permissions)
            .claim("userStatus", userStatus)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(accessTokenExpiration)))
            .signWith(signingKey)
            .compact();
    }

    public String generateOpaqueRefreshToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public Duration getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }

    public Claims parseAccessToken(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
