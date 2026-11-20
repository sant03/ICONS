package com.plastyfreddy.icons.auth;

import com.plastyfreddy.icons.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión con código de empresa + credenciales")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "Registro público de nuevo usuario (excluye rol Gerencial)")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/roles")
    @Operation(summary = "Listar roles disponibles para registro público (excluye Gerencial)")
    public ResponseEntity<List<PublicRoleResponse>> publicRoles(@RequestParam String tenant) {
        return ResponseEntity.ok(authService.listPublicRoles(tenant));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token usando refresh token (con rotación)")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión (revocar refresh token)")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshRequest request) {
        String refreshToken = request != null ? request.refreshToken() : null;
        authService.logout(refreshToken);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout-all")
    @Operation(summary = "Cerrar todas las sesiones del usuario actual")
    public ResponseEntity<Void> logoutAll() {
        authService.logoutAll(CurrentUser.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/request")
    @Operation(summary = "Solicitar código de recuperación de contraseña")
    public ResponseEntity<Void> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirmar recuperación de contraseña con código")
    public ResponseEntity<Void> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener información del usuario autenticado")
    public ResponseEntity<AuthUserInfo> me() {
        return ResponseEntity.ok(authService.getMe());
    }

    @GetMapping("/profile")
    @Operation(summary = "Obtener perfil completo del usuario autenticado")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(authService.getProfile());
    }

    @PutMapping("/profile")
    @Operation(summary = "Actualizar perfil del usuario autenticado")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }
}
