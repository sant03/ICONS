package com.plastyfreddy.icons.users;

import com.plastyfreddy.icons.users.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "Roles y permisos")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLES_VIEW')")
    @Operation(summary = "Listar roles del tenant")
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(roleService.listRoles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_VIEW')")
    @Operation(summary = "Obtener un rol con sus permisos")
    public ResponseEntity<RoleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.getRole(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLES_CREATE')")
    @Operation(summary = "Crear un nuevo rol")
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.createRole(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLES_EDIT')")
    @Operation(summary = "Actualizar un rol y sus permisos")
    public ResponseEntity<RoleResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(roleService.updateRole(id, request));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('ROLES_VIEW')")
    @Operation(summary = "Listar todos los permisos disponibles")
    public ResponseEntity<List<PermissionResponse>> listPermissions() {
        return ResponseEntity.ok(roleService.listPermissions());
    }
}
