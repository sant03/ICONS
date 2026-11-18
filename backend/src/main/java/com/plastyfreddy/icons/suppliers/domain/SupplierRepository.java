package com.plastyfreddy.icons.suppliers.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByIdAndTenantIdAndDeletedAtIsNull(Long id, Long tenantId);

    Page<Supplier> findByTenantIdAndDeletedAtIsNull(Long tenantId, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.tenantId = :tenantId AND s.deletedAt IS NULL " +
           "AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Supplier> searchByTenantId(Long tenantId, String search, Pageable pageable);

    boolean existsByTenantIdAndCodeAndDeletedAtIsNull(Long tenantId, String code);
}
