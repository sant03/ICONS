package com.plastyfreddy.icons.notifications.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findByTenantIdAndUserId(Long tenantId, Long userId);

    Optional<PushSubscription> findByTenantIdAndEndpoint(Long tenantId, String endpoint);

    @Modifying
    @Query("DELETE FROM PushSubscription p WHERE p.tenantId = :tenantId AND p.endpoint = :endpoint")
    void deleteByTenantIdAndEndpoint(Long tenantId, String endpoint);

    @Modifying
    @Query("DELETE FROM PushSubscription p WHERE p.tenantId = :tenantId AND p.userId = :userId")
    void deleteAllByTenantIdAndUserId(Long tenantId, Long userId);
}
