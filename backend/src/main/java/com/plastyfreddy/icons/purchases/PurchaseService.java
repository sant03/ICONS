package com.plastyfreddy.icons.purchases;

import com.plastyfreddy.icons.catalog.StockService;
import com.plastyfreddy.icons.catalog.domain.MovementType;
import com.plastyfreddy.icons.catalog.domain.Product;
import com.plastyfreddy.icons.catalog.domain.ProductRepository;
import com.plastyfreddy.icons.purchases.domain.*;
import com.plastyfreddy.icons.purchases.dto.*;
import com.plastyfreddy.icons.sequence.SequenceService;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<PurchaseResponse> list(String search, Pageable pageable) {
        Long tenantId = TenantContext.require();
        Page<Purchase> page = (search != null && !search.isBlank())
            ? purchaseRepository.searchByTenantId(tenantId, search.trim(), pageable)
            : purchaseRepository.findByTenantIdOrderByDateDescCreatedAtDesc(tenantId, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        Purchase purchase = purchaseRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Compra", id));
        return toResponse(purchase);
    }

    @Transactional
    public PurchaseResponse create(CreatePurchaseRequest request) {
        Long tenantId = TenantContext.require();
        String code = sequenceService.nextCode("PURCHASE");

        Purchase purchase = Purchase.builder()
            .code(code)
            .supplierId(request.supplierId())
            .supplierName(request.supplierName())
            .date(request.date())
            .notes(request.notes())
            .build();

        BigDecimal total = BigDecimal.ZERO;

        for (var itemReq : request.items()) {
            Product product = productRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(itemReq.productId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Producto", itemReq.productId()));

            BigDecimal lineTotal = itemReq.unitPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));

            PurchaseItem item = PurchaseItem.builder()
                .productId(product.getId())
                .productName(product.getReference())
                .quantity(itemReq.quantity())
                .unitPrice(itemReq.unitPrice())
                .total(lineTotal)
                .build();
            purchase.addItem(item);

            total = total.add(lineTotal);

            stockService.adjustStock(product.getId(), MovementType.PURCHASE_IN,
                itemReq.quantity(), "PURCHASE", null, "Compra " + code);
        }

        purchase.setTotal(total);
        purchase = purchaseRepository.save(purchase);
        return toResponse(purchase);
    }

    @Transactional
    public void cancel(Long id) {
        Long tenantId = TenantContext.require();
        Purchase purchase = purchaseRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Compra", id));

        if (purchase.isCancelled()) {
            throw new BusinessException("La compra ya está cancelada");
        }

        for (PurchaseItem item : purchase.getItems()) {
            stockService.adjustStock(item.getProductId(), MovementType.ADJUSTMENT_OUT,
                item.getQuantity(), "PURCHASE", purchase.getId(),
                "Devolución por cancelación de compra " + purchase.getCode());
        }

        purchase.cancel();
    }

    private PurchaseResponse toResponse(Purchase p) {
        var items = p.getItems().stream()
            .map(i -> new PurchaseItemResponse(
                i.getId(), i.getProductId(), i.getProductName(),
                i.getQuantity(), i.getUnitPrice(), i.getTotal()))
            .toList();
        return new PurchaseResponse(
            p.getId(), p.getCode(), p.getSupplierId(), p.getSupplierName(),
            p.getDate(), p.getTotal(), p.getStatus(), p.getNotes(),
            items, p.getCreatedAt(), p.getCreatedBy()
        );
    }
}
