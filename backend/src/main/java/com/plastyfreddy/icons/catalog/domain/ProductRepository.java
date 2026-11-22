package com.plastyfreddy.icons.catalog.domain;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndTenantIdAndDeletedAtIsNull(Long id, Long tenantId);

    Page<Product> findByTenantIdAndDeletedAtIsNull(Long tenantId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId AND p.deletedAt IS NULL " +
           "AND (LOWER(p.reference) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchByTenantId(Long tenantId, String search, Pageable pageable);

    Page<Product> findByTenantIdAndCategoryIdAndDeletedAtIsNull(Long tenantId, Long categoryId, Pageable pageable);

    boolean existsByTenantIdAndCodeAndDeletedAtIsNull(Long tenantId, String code);

    boolean existsByTenantIdAndReferenceAndDeletedAtIsNull(Long tenantId, String reference);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.tenantId = :tenantId AND p.deletedAt IS NULL")
    Optional<Product> findForUpdate(Long id, Long tenantId);

    long countByTenantIdAndDeletedAtIsNull(Long tenantId);

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(code, LENGTH(:prefix) + 2) AS UNSIGNED)), 0) " +
                   "FROM products WHERE tenant_id = :tenantId AND code LIKE CONCAT(:prefix, '-%')",
           nativeQuery = true)
    int findMaxCodeNumberByPrefix(Long tenantId, String prefix);
}
