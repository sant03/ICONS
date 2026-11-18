package com.plastyfreddy.icons.sales.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Page<CustomerOrder> findByTenantIdOrderByDateDescCreatedAtDesc(Long tenantId, Pageable pageable);

    Optional<CustomerOrder> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT o FROM CustomerOrder o WHERE o.tenantId = :tenantId " +
           "AND (LOWER(o.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.customerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<CustomerOrder> searchByTenantId(Long tenantId, String search, Pageable pageable);

    Page<CustomerOrder> findByTenantIdAndStatus(Long tenantId, String status, Pageable pageable);
}
