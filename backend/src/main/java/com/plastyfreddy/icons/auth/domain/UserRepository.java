package com.plastyfreddy.icons.auth.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByTenantIdAndUsername(Long tenantId, String username);

    Optional<User> findByTenantIdAndEmail(Long tenantId, String email);

    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND u.deletedAt IS NULL")
    Page<User> findByTenantId(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.tenantId = :tenantId AND u.deletedAt IS NULL " +
           "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchByTenantId(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);

    boolean existsByTenantIdAndUsername(Long tenantId, String username);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    long countByTenantId(Long tenantId);

    @Query(value = """
        SELECT CASE WHEN EXISTS (
            SELECT 1 FROM sales WHERE tenant_id = :tenantId AND created_by = :username
            UNION ALL
            SELECT 1 FROM purchases WHERE tenant_id = :tenantId AND created_by = :username
            UNION ALL
            SELECT 1 FROM customer_orders WHERE tenant_id = :tenantId AND created_by = :username
            UNION ALL
            SELECT 1 FROM purchase_orders WHERE tenant_id = :tenantId AND created_by = :username
        ) THEN 1 ELSE 0 END
        """, nativeQuery = true)
    int countAssociatedRecords(@Param("tenantId") Long tenantId, @Param("username") String username);

    default boolean hasAssociatedRecords(Long tenantId, String username) {
        return countAssociatedRecords(tenantId, username) > 0;
    }
}
