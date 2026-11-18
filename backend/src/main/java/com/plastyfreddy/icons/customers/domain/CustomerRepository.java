package com.plastyfreddy.icons.customers.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByIdAndTenantIdAndDeletedAtIsNull(Long id, Long tenantId);

    Page<Customer> findByTenantIdAndDeletedAtIsNull(Long tenantId, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND c.deletedAt IS NULL " +
           "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR c.docId LIKE CONCAT('%', :search, '%') " +
           "OR c.phone LIKE CONCAT('%', :search, '%'))")
    Page<Customer> searchByTenantId(Long tenantId, String search, Pageable pageable);

    boolean existsByTenantIdAndDocIdAndDeletedAtIsNull(Long tenantId, String docId);
}
