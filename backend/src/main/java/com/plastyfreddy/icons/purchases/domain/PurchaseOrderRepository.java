package com.plastyfreddy.icons.purchases.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.items WHERE po.id = :id AND po.tenantId = :tenantId")
    Optional<PurchaseOrder> findByIdAndTenantIdWithItems(Long id, Long tenantId);

    Page<PurchaseOrder> findByTenantIdOrderByDateDescCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<PurchaseOrder> findByTenantIdAndStatus(Long tenantId, PurchaseOrderStatus status, Pageable pageable);

    @Query("SELECT po FROM PurchaseOrder po WHERE po.tenantId = :tenantId " +
           "AND (LOWER(po.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(po.supplierName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PurchaseOrder> searchByTenantId(Long tenantId, String search, Pageable pageable);
}
