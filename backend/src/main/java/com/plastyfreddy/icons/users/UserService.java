package com.plastyfreddy.icons.users;

import com.plastyfreddy.icons.auth.domain.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.users.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<UserResponse> list(String search, Pageable pageable) {
        Long tenantId = TenantContext.require();
        Page<User> page = (search != null && !search.isBlank())
            ? userRepository.searchByTenantId(tenantId, search.trim(), pageable)
            : userRepository.findByTenantId(tenantId, pageable);
        return page.map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        Long tenantId = TenantContext.require();

        if (userRepository.existsByTenantIdAndUsername(tenantId, request.username())) {
            throw BusinessException.conflict("El nombre de usuario ya está en uso");
        }
        if (userRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
            throw BusinessException.conflict("El email ya está en uso");
        }

        roleRepository.findByIdAndTenantId(request.roleId(), tenantId)
            .orElseThrow(() -> BusinessException.notFound("Rol", request.roleId()));

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));

        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
                throw BusinessException.conflict("El email ya está en uso");
            }
            user.setEmail(request.email());
        }
        if (request.docId() != null) user.setDocId(request.docId());
        if (request.dateOfBirth() != null) user.setDateOfBirth(request.dateOfBirth());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.landline() != null) user.setLandline(request.landline());
        if (request.positionName() != null) user.setPositionName(request.positionName());
        if (request.roleId() != null) {
            roleRepository.findByIdAndTenantId(request.roleId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Rol", request.roleId()));
            user.setRoleId(request.roleId());
        }

        return userMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("La contraseña actual es incorrecta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", userId));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.resetFailedAttempts();
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Transactional
    public void unlock(Long userId) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", userId));

        user.resetFailedAttempts();
        if (user.getStatus() == UserStatus.LOCKED) {
            user.setStatus(UserStatus.ACTIVE);
        }
    }

    @Transactional
    public UserResponse restrict(Long id) {
        User user = findActiveUser(id);
        user.restrict();
        refreshTokenRepository.revokeAllByUserId(id);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse unrestrict(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        if (user.getStatus() != UserStatus.RESTRICTED) {
            throw new BusinessException("El usuario no está restringido");
        }
        user.unrestrict();
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse suspend(Long id, String isoDuration) {
        User user = findActiveUser(id);
        Duration duration = Duration.parse(isoDuration);
        user.suspend(Instant.now().plus(duration));
        refreshTokenRepository.revokeAllByUserId(id);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse unsuspend(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        if (user.getStatus() != UserStatus.SUSPENDED) {
            throw new BusinessException("El usuario no está suspendido");
        }
        user.unsuspend();
        return userMapper.toResponse(user);
    }

    @Transactional
    public void deactivate(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new BusinessException("El usuario ya está desactivado");
        }
        if (userRepository.hasAssociatedRecords(tenantId, user.getUsername())) {
            throw BusinessException.conflict(
                "No se puede desactivar: el usuario tiene registros asociados (ventas, compras, etc.)");
        }
        user.softDelete();
        refreshTokenRepository.revokeAllByUserId(id);
    }

    @Transactional
    public UserResponse reactivate(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        if (user.getStatus() != UserStatus.DEACTIVATED) {
            throw new BusinessException("El usuario no está desactivado");
        }
        user.reactivate();
        return userMapper.toResponse(user);
    }

    private User findActiveUser(Long id) {
        Long tenantId = TenantContext.require();
        User user = userRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Usuario", id));
        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw BusinessException.notFound("Usuario", id);
        }
        return user;
    }

}
