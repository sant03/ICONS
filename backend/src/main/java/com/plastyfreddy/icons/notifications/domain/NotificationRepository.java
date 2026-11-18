package com.plastyfreddy.icons.notifications.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByTenantIdAndUserIdOrderByCreatedAtDesc(Long tenantId, Long userId, Pageable pageable);

    Page<Notification> findByTenantIdAndUserIdAndReadFalseOrderByCreatedAtDesc(Long tenantId, Long userId, Pageable pageable);

    Optional<Notification> findByIdAndTenantId(Long id, Long tenantId);

    long countByTenantIdAndUserIdAndReadFalse(Long tenantId, Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.tenantId = :tenantId AND n.userId = :userId AND n.read = false")
    void markAllAsReadByUser(Long tenantId, Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.tenantId = :tenantId AND n.userId = :userId")
    void deleteAllByTenantIdAndUserId(Long tenantId, Long userId);
}
