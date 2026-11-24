package com.plastyfreddy.icons.dispatches.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryDriverRepository extends JpaRepository<DeliveryDriver, Long> {

    Optional<DeliveryDriver> findByIdAndTenantId(Long id, Long tenantId);

    Page<DeliveryDriver> findByTenantIdOrderByNameAsc(Long tenantId, Pageable pageable);

    Page<DeliveryDriver> findByTenantIdAndStatus(Long tenantId, DriverStatus status, Pageable pageable);
}
