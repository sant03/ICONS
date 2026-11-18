package com.plastyfreddy.icons.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByTenantId(Long tenantId);

    Optional<Role> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Role> findByTenantIdAndName(Long tenantId, String name);

    boolean existsByTenantIdAndName(Long tenantId, String name);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id AND r.tenantId = :tenantId")
    Optional<Role> findByIdAndTenantIdWithPermissions(Long id, Long tenantId);
}
