package com.plastyfreddy.icons.auth;

import com.plastyfreddy.icons.auth.domain.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.JwtService;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.tenants.domain.Tenant;
import com.plastyfreddy.icons.tenants.domain.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${icons.security.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${icons.security.auth.lockout-duration:15m}")
    private Duration lockoutDuration;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Tenant tenant = tenantRepository.findBySlug(request.tenant())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                "Código de empresa no válido"));

        if (!"ACTIVE".equals(tenant.getStatus())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "La empresa está inactiva");
        }

        User user = userRepository.findByTenantIdAndUsername(tenant.getId(), request.username())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                "Credenciales incorrectas"));

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }

        if (user.isLocked()) {
            throw new BusinessException(HttpStatus.FORBIDDEN,
                "Cuenta bloqueada. Intente de nuevo más tarde");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            if (user.isSuspensionExpired()) {
                user.unsuspend();
            } else {
                throw new BusinessException(HttpStatus.FORBIDDEN, "Cuenta suspendida");
            }
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            handleFailedAttempt(user);
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }

        user.resetFailedAttempts();

        TenantContext.set(tenant.getId());

        var permissions = loadPermissions(user);
        String accessToken = jwtService.generateAccessToken(
            user.getId(), user.getUsername(), tenant.getId(), permissions,
            user.getStatus().name()
        );

        String rawRefreshToken = jwtService.generateOpaqueRefreshToken();
        saveRefreshToken(rawRefreshToken, user.getId(), tenant.getId());

        return new AuthResponse(
            accessToken,
            rawRefreshToken,
            mapToUserInfo(user, tenant, permissions)
        );
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        String tokenHash = hashToken(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                "Token de refresco inválido"));

        if (!stored.isUsable()) {
            if (!stored.isRevoked()) {
                stored.setRevoked(true);
            }
            throw new BusinessException(HttpStatus.UNAUTHORIZED,
                "Token de refresco expirado o revocado");
        }

        // Rotation: revoke old, issue new
        stored.setRevoked(true);

        User user = userRepository.findById(stored.getUserId())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                "Usuario no encontrado"));

        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Cuenta desactivada");
        }
        if (user.getStatus() == UserStatus.LOCKED && user.isLocked()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Cuenta bloqueada");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            if (user.isSuspensionExpired()) {
                user.unsuspend();
            } else {
                throw new BusinessException(HttpStatus.FORBIDDEN, "Cuenta suspendida");
            }
        }

        Tenant tenant = tenantRepository.findById(stored.getTenantId())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED,
                "Empresa no encontrada"));

        TenantContext.set(tenant.getId());

        var permissions = loadPermissions(user);
        String newAccessToken = jwtService.generateAccessToken(
            user.getId(), user.getUsername(), tenant.getId(), permissions,
            user.getStatus().name()
        );

        String newRawRefreshToken = jwtService.generateOpaqueRefreshToken();
        saveRefreshToken(newRawRefreshToken, user.getId(), tenant.getId());

        return new AuthResponse(
            newAccessToken,
            newRawRefreshToken,
            mapToUserInfo(user, tenant, permissions)
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
            .ifPresent(rt -> rt.setRevoked(true));
    }

    @Transactional
    public void logoutAll(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        Tenant tenant = tenantRepository.findBySlug(request.tenant())
            .orElse(null);
        // Always return success to prevent email enumeration
        if (tenant == null) return;

        User user = userRepository.findByTenantIdAndEmail(tenant.getId(), request.email())
            .orElse(null);
        if (user == null) return;

        passwordResetRepository.invalidateAllByUserId(user.getId());

        String rawCode = generateResetCode();
        PasswordReset reset = PasswordReset.builder()
            .tenantId(tenant.getId())
            .userId(user.getId())
            .codeHash(hashToken(rawCode))
            .expiresAt(Instant.now().plus(Duration.ofMinutes(30)))
            .build();
        passwordResetRepository.save(reset);

        // TODO: Send email with rawCode via MailService
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        Tenant tenant = tenantRepository.findBySlug(request.tenant())
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                "Código de empresa no válido"));

        User user = userRepository.findByTenantIdAndEmail(tenant.getId(), request.email())
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                "Datos inválidos"));

        String codeHash = hashToken(request.code());
        var resets = passwordResetRepository
            .findByUserIdAndUsedFalseOrderByCreatedAtDesc(user.getId());

        PasswordReset validReset = resets.stream()
            .filter(pr -> pr.getCodeHash().equals(codeHash) && pr.isUsable())
            .findFirst()
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                "Código de recuperación inválido o expirado"));

        validReset.setUsed(true);
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.resetFailedAttempts();

        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    private static final String GERENCIAL_ROLE = "Gerencial";

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Tenant tenant = tenantRepository.findBySlug(request.tenant())
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                "Código de empresa no válido"));

        if (!"ACTIVE".equals(tenant.getStatus())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "La empresa está inactiva");
        }

        if (userRepository.existsByTenantIdAndUsername(tenant.getId(), request.username())) {
            throw BusinessException.conflict("El nombre de usuario ya está en uso");
        }
        if (userRepository.existsByTenantIdAndEmail(tenant.getId(), request.email())) {
            throw BusinessException.conflict("El email ya está en uso");
        }

        Role role = roleRepository.findByIdAndTenantId(request.roleId(), tenant.getId())
            .orElseThrow(() -> BusinessException.notFound("Rol", request.roleId()));

        if (GERENCIAL_ROLE.equalsIgnoreCase(role.getName())) {
            throw new BusinessException(HttpStatus.FORBIDDEN,
                "No se permite el auto-registro con el rol Gerencial");
        }

        User user = User.builder()
            .username(request.username())
            .email(request.email())
            .passwordHash(passwordEncoder.encode(request.password()))
            .fullName(request.fullName())
            .docId(request.docId())
            .dateOfBirth(request.dateOfBirth())
            .phone(request.phone())
            .positionName(request.positionName())
            .roleId(role.getId())
            .build();
        user.setTenantId(tenant.getId());
        user = userRepository.save(user);

        TenantContext.set(tenant.getId());

        var permissions = loadPermissions(user);
        String accessToken = jwtService.generateAccessToken(
            user.getId(), user.getUsername(), tenant.getId(), permissions,
            user.getStatus().name()
        );

        String rawRefreshToken = jwtService.generateOpaqueRefreshToken();
        saveRefreshToken(rawRefreshToken, user.getId(), tenant.getId());

        return new AuthResponse(
            accessToken,
            rawRefreshToken,
            mapToUserInfo(user, tenant, permissions)
        );
    }

    @Transactional(readOnly = true)
    public List<PublicRoleResponse> listPublicRoles(String tenantSlug) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
            .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST,
                "Código de empresa no válido"));

        return roleRepository.findByTenantId(tenant.getId()).stream()
            .filter(r -> !GERENCIAL_ROLE.equalsIgnoreCase(r.getName()))
            .map(r -> new PublicRoleResponse(r.getId(), r.getName(), r.getDescription()))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuthUserInfo getMe() {
        Long userId = com.plastyfreddy.icons.shared.security.CurrentUser.getUserId();
        Long tenantId = com.plastyfreddy.icons.shared.security.CurrentUser.getTenantId();

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new BusinessException("Empresa no encontrada"));

        var permissions = loadPermissions(user);
        return mapToUserInfo(user, tenant, permissions);
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile() {
        Long userId = com.plastyfreddy.icons.shared.security.CurrentUser.getUserId();
        Long tenantId = com.plastyfreddy.icons.shared.security.CurrentUser.getTenantId();

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new BusinessException("Empresa no encontrada"));

        Role role = roleRepository.findByIdAndTenantId(user.getRoleId(), tenantId)
            .orElse(null);

        return new ProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getDocId(),
            user.getDateOfBirth(),
            user.getPhone(),
            user.getLandline(),
            user.getPositionName(),
            user.getAvatarUrl(),
            role != null ? role.getName() : null,
            user.getStatus().name(),
            user.getCreatedAt(),
            tenant.getName()
        );
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        Long userId = com.plastyfreddy.icons.shared.security.CurrentUser.getUserId();
        Long tenantId = com.plastyfreddy.icons.shared.security.CurrentUser.getTenantId();

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
                throw BusinessException.conflict("El email ya está en uso");
            }
            user.setEmail(request.email());
        }
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.docId() != null) user.setDocId(request.docId());
        if (request.dateOfBirth() != null) user.setDateOfBirth(request.dateOfBirth());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.landline() != null) user.setLandline(request.landline());
        if (request.positionName() != null) user.setPositionName(request.positionName());

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new BusinessException("Empresa no encontrada"));
        Role role = roleRepository.findByIdAndTenantId(user.getRoleId(), tenantId)
            .orElse(null);

        return new ProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getDocId(),
            user.getDateOfBirth(),
            user.getPhone(),
            user.getLandline(),
            user.getPositionName(),
            user.getAvatarUrl(),
            role != null ? role.getName() : null,
            user.getStatus().name(),
            user.getCreatedAt(),
            tenant.getName()
        );
    }

    private void handleFailedAttempt(User user) {
        user.incrementFailedAttempts();
        if (user.getFailedAttempts() >= maxFailedAttempts) {
            user.lock(Instant.now().plus(lockoutDuration));
        }
    }

    private java.util.Set<String> loadPermissions(User user) {
        Role role = roleRepository.findByIdAndTenantIdWithPermissions(
                user.getRoleId(), user.getTenantId())
            .orElseThrow(() -> new BusinessException("Rol no encontrado"));
        return role.getPermissions().stream()
            .map(Permission::getCode)
            .collect(Collectors.toSet());
    }

    private void saveRefreshToken(String rawToken, Long userId, Long tenantId) {
        RefreshToken rt = RefreshToken.builder()
            .tenantId(tenantId)
            .userId(userId)
            .tokenHash(hashToken(rawToken))
            .expiresAt(Instant.now().plus(jwtService.getRefreshTokenExpiration()))
            .build();
        refreshTokenRepository.save(rt);
    }

    private AuthUserInfo mapToUserInfo(User user, Tenant tenant, java.util.Collection<String> permissions) {
        return new AuthUserInfo(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getStatus().name(),
            tenant.getName(),
            tenant.getSlug(),
            List.copyOf(permissions)
        );
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private String generateResetCode() {
        byte[] bytes = new byte[4];
        secureRandom.nextBytes(bytes);
        int code = Math.abs(java.nio.ByteBuffer.wrap(bytes).getInt()) % 1_000_000;
        return String.format("%06d", code);
    }
}
