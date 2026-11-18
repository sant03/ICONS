package com.plastyfreddy.icons.users;

import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.web.PageResponse;
import com.plastyfreddy.icons.users.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USERS_VIEW')")
    @Operation(summary = "Listar usuarios del tenant")
    public ResponseEntity<PageResponse<UserResponse>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "fullName") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(userService.list(search, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USERS_VIEW')")
    @Operation(summary = "Obtener un usuario por ID")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USERS_CREATE')")
    @Operation(summary = "Crear un nuevo usuario")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USERS_EDIT')")
    @Operation(summary = "Actualizar un usuario")
    public ResponseEntity<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @PostMapping("/{id}/change-password")
    @Operation(summary = "Cambiar contraseña propia")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (!id.equals(CurrentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USERS_EDIT')")
    @Operation(summary = "Restablecer contraseña de un usuario (admin)")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        userService.resetPassword(id, body.get("newPassword"));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasAuthority('USERS_EDIT')")
    @Operation(summary = "Desbloquear un usuario")
    public ResponseEntity<Void> unlock(@PathVariable Long id) {
        userService.unlock(id);
        return ResponseEntity.noContent().build();
    }
}
