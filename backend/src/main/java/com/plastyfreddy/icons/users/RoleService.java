package com.plastyfreddy.icons.users;

import com.plastyfreddy.icons.auth.domain.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.users.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> listRoles() {
        Long tenantId = TenantContext.require();
        return roleRepository.findByTenantId(tenantId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse getRole(Long id) {
        Long tenantId = TenantContext.require();
        Role role = roleRepository.findByIdAndTenantIdWithPermissions(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Rol", id));
        return toResponse(role);
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request) {
        Long tenantId = TenantContext.require();

        if (roleRepository.existsByTenantIdAndName(tenantId, request.name())) {
            throw BusinessException.conflict("Ya existe un rol con ese nombre");
        }

        Role role = Role.builder()
            .name(request.name())
            .description(request.description())
            .build();

        if (request.permissions() != null && !request.permissions().isEmpty()) {
            var perms = permissionRepository.findByCodeIn(request.permissions());
            role.setPermissions(new HashSet<>(perms));
        }

        role = roleRepository.save(role);
        return toResponse(role);
    }

    @Transactional
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        Long tenantId = TenantContext.require();
        Role role = roleRepository.findByIdAndTenantIdWithPermissions(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Rol", id));

        if (role.isSystemRole()) {
            throw BusinessException.forbidden("No se pueden modificar roles del sistema");
        }

        if (request.name() != null && !request.name().equals(role.getName())) {
            if (roleRepository.existsByTenantIdAndName(tenantId, request.name())) {
                throw BusinessException.conflict("Ya existe un rol con ese nombre");
            }
            role.setName(request.name());
        }

        if (request.description() != null) {
            role.setDescription(request.description());
        }

        if (request.permissions() != null) {
            var perms = permissionRepository.findByCodeIn(request.permissions());
            role.setPermissions(new HashSet<>(perms));
        }

        return toResponse(role);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listPermissions() {
        return permissionRepository.findAllByOrderByCodeAsc().stream()
            .map(p -> new PermissionResponse(p.getId(), p.getCode(), p.getDescription()))
            .toList();
    }

    private RoleResponse toResponse(Role role) {
        var permCodes = role.getPermissions().stream()
            .map(Permission::getCode)
            .collect(Collectors.toSet());
        return new RoleResponse(
            role.getId(),
            role.getName(),
            role.getDescription(),
            role.isSystemRole(),
            permCodes
        );
    }
}
