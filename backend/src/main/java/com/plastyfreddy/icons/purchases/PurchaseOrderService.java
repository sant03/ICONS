package com.plastyfreddy.icons.purchases;

import com.plastyfreddy.icons.catalog.domain.Product;
import com.plastyfreddy.icons.catalog.domain.ProductRepository;
import com.plastyfreddy.icons.purchases.domain.*;
import com.plastyfreddy.icons.purchases.dto.*;
import com.plastyfreddy.icons.sequence.SequenceService;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> list(String search, String status, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<PurchaseOrder> page;
        if (search != null && !search.isBlank()) {
            page = orderRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (status != null) {
            page = orderRepository.findByTenantIdAndStatus(
                tenantId, PurchaseOrderStatus.valueOf(status), pageable);
        } else {
            page = orderRepository.findByTenantIdOrderByDateDescCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        PurchaseOrder order = orderRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Orden de compra", id));
        return toResponse(order);
    }

    @Transactional
    public PurchaseOrderResponse create(CreatePurchaseOrderRequest request) {
        Long tenantId = TenantContext.require();
        String code = sequenceService.nextCode("PURCHASE_ORDER");

        PurchaseOrder order = PurchaseOrder.builder()
            .code(code)
            .supplierId(request.supplierId())
            .supplierName(request.supplierName())
            .supplierAddress(request.supplierAddress())
            .supplierPhone(request.supplierPhone())
            .supplierEmail(request.supplierEmail())
            .date(request.date())
            .madeOn(request.madeOn())
            .receptionDate(request.receptionDate())
            .madeBy(request.madeBy())
            .userUsername(CurrentUser.getUsername())
            .area(request.area())
            .paymentMethod(request.paymentMethod())
            .approvedBy(request.approvedBy())
            .scheduledDate(request.scheduledDate())
            .build();

        BigDecimal total = BigDecimal.ZERO;
        int totalProducts = 0;

        for (var itemReq : request.items()) {
            Product product = productRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(itemReq.productId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Producto", itemReq.productId()));

            BigDecimal lineTotal = itemReq.unitPrice().multiply(BigDecimal.valueOf(itemReq.quantity()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                .productId(product.getId())
                .productName(product.getReference())
                .quantity(itemReq.quantity())
                .unitPrice(itemReq.unitPrice())
                .total(lineTotal)
                .build();
            order.addItem(item);

            total = total.add(lineTotal);
            totalProducts += itemReq.quantity();
        }

        order.setTotal(total);
        order.setTotalProducts(totalProducts);

        order = orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public PurchaseOrderResponse updateStatus(Long id, String status) {
        Long tenantId = TenantContext.require();
        PurchaseOrder order = orderRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Orden de compra", id));

        order.setStatus(PurchaseOrderStatus.valueOf(status));
        return toResponse(order);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        PurchaseOrder order = orderRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Orden de compra", id));
        orderRepository.delete(order);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        var items = po.getItems().stream()
            .map(i -> new PurchaseOrderItemResponse(
                i.getId(), i.getProductId(), i.getProductName(),
                i.getQuantity(), i.getUnitPrice(), i.getTotal()))
            .toList();
        return new PurchaseOrderResponse(
            po.getId(), po.getCode(), po.getSupplierId(), po.getSupplierName(),
            po.getSupplierAddress(), po.getSupplierPhone(), po.getSupplierEmail(),
            po.getDate(), po.getMadeOn(), po.getReceptionDate(),
            po.getStatus().name(), po.getMadeBy(), po.getUserUsername(),
            po.getArea(), po.getPaymentMethod(), po.getTotalProducts(), po.getTotal(),
            po.getApprovedBy(), po.getScheduledDate(), items, po.getCreatedAt()
        );
    }
}
