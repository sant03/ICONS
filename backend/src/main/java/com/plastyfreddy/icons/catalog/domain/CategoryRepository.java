package com.plastyfreddy.icons.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByTenantIdAndDeletedAtIsNullOrderByNameAsc(Long tenantId);

    Optional<Category> findByIdAndTenantIdAndDeletedAtIsNull(Long id, Long tenantId);

    boolean existsByTenantIdAndNameAndDeletedAtIsNull(Long tenantId, String name);
}
