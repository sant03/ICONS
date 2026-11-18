package com.plastyfreddy.icons.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {

    List<PasswordReset> findByUserIdAndUsedFalseOrderByCreatedAtDesc(Long userId);

    @Modifying
    @Query("UPDATE PasswordReset pr SET pr.used = true WHERE pr.userId = :userId AND pr.used = false")
    void invalidateAllByUserId(Long userId);
}
