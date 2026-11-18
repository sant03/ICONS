package com.plastyfreddy.icons.purchases.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("SELECT p FROM Purchase p LEFT JOIN FETCH p.items WHERE p.id = :id AND p.tenantId = :tenantId")
    Optional<Purchase> findByIdAndTenantIdWithItems(Long id, Long tenantId);

    Page<Purchase> findByTenantIdOrderByDateDescCreatedAtDesc(Long tenantId, Pageable pageable);

    @Query("SELECT p FROM Purchase p WHERE p.tenantId = :tenantId " +
           "AND (LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.supplierName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Purchase> searchByTenantId(Long tenantId, String search, Pageable pageable);
}
