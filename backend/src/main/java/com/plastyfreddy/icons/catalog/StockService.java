package com.plastyfreddy.icons.catalog;

import com.plastyfreddy.icons.catalog.domain.*;
import com.plastyfreddy.icons.catalog.dto.StockMovementResponse;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import com.plastyfreddy.icons.shared.web.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductRepository productRepository;
    private final StockMovementRepository movementRepository;

    @Transactional
    public void adjustStock(Long productId, MovementType type, int quantity,
                            String referenceType, Long referenceId, String notes) {
        Long tenantId = TenantContext.require();
        Product product = productRepository.findForUpdate(productId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Producto", productId));

        int newStock = switch (type) {
            case PURCHASE_IN, ADJUSTMENT_IN, RETURN_IN, INITIAL -> product.getStock() + quantity;
            case SALE_OUT, ADJUSTMENT_OUT -> {
                if (product.getStock() < quantity) {
                    throw new BusinessException("Stock insuficiente para %s (disponible: %d, solicitado: %d)"
                        .formatted(product.getReference(), product.getStock(), quantity));
                }
                yield product.getStock() - quantity;
            }
        };

        product.setStock(newStock);

        StockMovement movement = StockMovement.builder()
            .tenantId(tenantId)
            .productId(productId)
            .type(type)
            .quantity(quantity)
            .stockAfter(newStock)
            .referenceType(referenceType)
            .referenceId(referenceId)
            .notes(notes)
            .createdBy(CurrentUser.getUsername())
            .build();
        movementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public PageResponse<StockMovementResponse> getMovements(Long productId, Pageable pageable) {
        Long tenantId = TenantContext.require();
        productRepository.findByIdAndTenantIdAndDeletedAtIsNull(productId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Producto", productId));

        var page = movementRepository
            .findByTenantIdAndProductIdOrderByCreatedAtDesc(tenantId, productId, pageable)
            .map(m -> new StockMovementResponse(
                m.getId(),
                m.getType().name(),
                m.getQuantity(),
                m.getStockAfter(),
                m.getReferenceType(),
                m.getReferenceId(),
                m.getNotes(),
                m.getCreatedBy(),
                m.getCreatedAt()
            ));
        return PageResponse.from(page);
    }
}
