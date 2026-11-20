package com.plastyfreddy.icons.auth.domain;

import com.plastyfreddy.icons.shared.tenant.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "doc_id", length = 30)
    private String docId;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String landline;

    @Column(name = "position_name", length = 100)
    private String positionName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "failed_attempts", nullable = false)
    @Builder.Default
    private int failedAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "suspended_until")
    private Instant suspendedUntil;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public boolean isLocked() {
        return lockedUntil != null && Instant.now().isBefore(lockedUntil);
    }

    public boolean isSuspensionExpired() {
        return status == UserStatus.SUSPENDED
            && suspendedUntil != null
            && Instant.now().isAfter(suspendedUntil);
    }

    public void incrementFailedAttempts() {
        this.failedAttempts++;
    }

    public void resetFailedAttempts() {
        this.failedAttempts = 0;
        this.lockedUntil = null;
    }

    public void lock(Instant until) {
        this.lockedUntil = until;
        this.status = UserStatus.LOCKED;
    }

    public void restrict() {
        this.status = UserStatus.RESTRICTED;
    }

    public void unrestrict() {
        this.status = UserStatus.ACTIVE;
    }

    public void suspend(Instant until) {
        this.status = UserStatus.SUSPENDED;
        this.suspendedUntil = until;
    }

    public void unsuspend() {
        this.status = UserStatus.ACTIVE;
        this.suspendedUntil = null;
    }

    public void softDelete() {
        this.status = UserStatus.DEACTIVATED;
        this.deletedAt = Instant.now();
    }

    public void reactivate() {
        this.status = UserStatus.ACTIVE;
        this.deletedAt = null;
    }
}
