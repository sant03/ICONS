package com.plastyfreddy.icons.audit.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<AuditLog> findByTenantIdAndCategoryOrderByCreatedAtDesc(Long tenantId, String category, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND (LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> searchByTenantId(Long tenantId, String search, Pageable pageable);

    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.tenantId = :tenantId")
    void deleteAllByTenantId(Long tenantId);
}
