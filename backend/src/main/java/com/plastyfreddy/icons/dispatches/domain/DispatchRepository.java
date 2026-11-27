package com.plastyfreddy.icons.dispatches.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DispatchRepository extends JpaRepository<Dispatch, Long> {

    @Query("SELECT d FROM Dispatch d LEFT JOIN FETCH d.history LEFT JOIN FETCH d.driver WHERE d.id = :id AND d.tenantId = :tenantId")
    Optional<Dispatch> findByIdAndTenantIdWithDetails(Long id, Long tenantId);

    Page<Dispatch> findByTenantIdOrderByScheduledDateDescCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<Dispatch> findByTenantIdAndStatus(Long tenantId, DispatchStatus status, Pageable pageable);

    @Query("SELECT d FROM Dispatch d WHERE d.tenantId = :tenantId " +
           "AND (LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(d.client) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(d.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Dispatch> searchByTenantId(Long tenantId, String search, Pageable pageable);

    long countByTenantIdAndStatus(Long tenantId, DispatchStatus status);

    boolean existsByTenantIdAndOrderId(Long tenantId, Long orderId);
}
