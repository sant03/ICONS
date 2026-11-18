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
        if (request.status() != null) {
            user.setStatus(UserStatus.valueOf(request.status()));
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
}
