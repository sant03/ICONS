package com.plastyfreddy.icons.suppliers;

import com.plastyfreddy.icons.sequence.SequenceService;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.suppliers.domain.Supplier;
import com.plastyfreddy.icons.suppliers.domain.SupplierRepository;
import com.plastyfreddy.icons.suppliers.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<SupplierResponse> list(String search, Pageable pageable) {
        Long tenantId = TenantContext.require();
        Page<Supplier> page = (search != null && !search.isBlank())
            ? supplierRepository.searchByTenantId(tenantId, search.trim(), pageable)
            : supplierRepository.findByTenantIdAndDeletedAtIsNull(tenantId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        return toResponse(findOrFail(id));
    }

    @Transactional
    public SupplierResponse create(CreateSupplierRequest request) {
        String code = sequenceService.nextCode("SUPPLIER");

        Supplier supplier = Supplier.builder()
            .name(request.name())
            .code(code)
            .phone(request.phone())
            .email(request.email())
            .address(request.address())
            .build();
        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(Long id, UpdateSupplierRequest request) {
        Supplier supplier = findOrFail(id);

        if (request.name() != null) supplier.setName(request.name());
        if (request.phone() != null) supplier.setPhone(request.phone());
        if (request.email() != null) supplier.setEmail(request.email());
        if (request.address() != null) supplier.setAddress(request.address());

        return toResponse(supplier);
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = findOrFail(id);
        supplier.softDelete();
    }

    private Supplier findOrFail(Long id) {
        Long tenantId = TenantContext.require();
        return supplierRepository.findByIdAndTenantIdAndDeletedAtIsNull(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Proveedor", id));
    }

    private SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(
            s.getId(), s.getName(), s.getCode(), s.getPhone(),
            s.getEmail(), s.getAddress(), s.getAvatarUrl(), s.getCreatedAt()
        );
    }
}
