package com.plastyfreddy.icons.customers;

import com.plastyfreddy.icons.customers.domain.Customer;
import com.plastyfreddy.icons.customers.domain.CustomerRepository;
import com.plastyfreddy.icons.customers.dto.*;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String search, Pageable pageable) {
        Long tenantId = TenantContext.require();
        Page<Customer> page = (search != null && !search.isBlank())
            ? customerRepository.searchByTenantId(tenantId, search.trim(), pageable)
            : customerRepository.findByTenantIdAndDeletedAtIsNull(tenantId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return toResponse(findOrFail(id));
    }

    @Transactional
    public CustomerResponse create(CreateCustomerRequest request) {
        Long tenantId = TenantContext.require();

        if (request.docId() != null && !request.docId().isBlank()) {
            if (customerRepository.existsByTenantIdAndDocIdAndDeletedAtIsNull(tenantId, request.docId())) {
                throw BusinessException.conflict("Ya existe un cliente con ese documento");
            }
        }

        Customer customer = Customer.builder()
            .name(request.name())
            .docId(request.docId())
            .phone(request.phone())
            .email(request.email())
            .address(request.address())
            .build();
        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(Long id, UpdateCustomerRequest request) {
        Long tenantId = TenantContext.require();
        Customer customer = findOrFail(id);

        if (request.name() != null) customer.setName(request.name());
        if (request.docId() != null && !request.docId().equals(customer.getDocId())) {
            if (!request.docId().isBlank() &&
                customerRepository.existsByTenantIdAndDocIdAndDeletedAtIsNull(tenantId, request.docId())) {
                throw BusinessException.conflict("Ya existe un cliente con ese documento");
            }
            customer.setDocId(request.docId());
        }
        if (request.phone() != null) customer.setPhone(request.phone());
        if (request.email() != null) customer.setEmail(request.email());
        if (request.address() != null) customer.setAddress(request.address());

        return toResponse(customer);
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = findOrFail(id);
        customer.softDelete();
    }

    private Customer findOrFail(Long id) {
        Long tenantId = TenantContext.require();
        return customerRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Cliente", id));
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(
            c.getId(), c.getName(), c.getDocId(), c.getPhone(),
            c.getEmail(), c.getAddress(), c.getAvatarUrl(), c.getCreatedAt()
        );
    }
}
