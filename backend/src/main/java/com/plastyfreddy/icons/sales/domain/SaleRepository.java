package com.plastyfreddy.icons.sales.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.items WHERE s.id = :id AND s.tenantId = :tenantId")
    Optional<Sale> findByIdAndTenantIdWithItems(Long id, Long tenantId);

    Page<Sale> findByTenantIdOrderByDateDescCreatedAtDesc(Long tenantId, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE s.tenantId = :tenantId " +
           "AND (LOWER(s.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Sale> searchByTenantId(Long tenantId, String search, Pageable pageable);

    Page<Sale> findByTenantIdAndCustomerId(Long tenantId, Long customerId, Pageable pageable);

    Page<Sale> findByTenantIdAndPaymentStatus(Long tenantId, PaymentStatus paymentStatus, Pageable pageable);
}
