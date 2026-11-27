package com.plastyfreddy.icons.sales;

import com.plastyfreddy.icons.catalog.domain.Product;
import com.plastyfreddy.icons.catalog.domain.ProductRepository;
import com.plastyfreddy.icons.sales.domain.*;
import com.plastyfreddy.icons.sales.dto.*;
import com.plastyfreddy.icons.sequence.SequenceService;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<CustomerOrderResponse> list(String search, String status, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<CustomerOrder> page;
        if (search != null && !search.isBlank()) {
            page = orderRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (status != null) {
            page = orderRepository.findByTenantIdAndStatus(tenantId, status, pageable);
        } else {
            page = orderRepository.findByTenantIdOrderByDateDescCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerOrderResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        CustomerOrder order = orderRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Pedido", id));
        return toResponse(order);
    }

    @Transactional
    public CustomerOrderResponse create(CreateOrderRequest request) {
        Long tenantId = TenantContext.require();
        String code = sequenceService.nextCode("CUSTOMER_ORDER");

        String paymentStatus = (request.paymentStatus() != null && !request.paymentStatus().isBlank())
            ? request.paymentStatus().trim()
            : "Pagado";
        String status = "Pagado".equalsIgnoreCase(paymentStatus) ? "COMPLETED" : "PENDING";

        CustomerOrder order = CustomerOrder.builder()
            .code(code)
            .customerId(request.customerId())
            .customerName(request.customerName())
            .date(request.date())
            .status(status)
            .paymentStatus(paymentStatus)
            .comments(request.comments())
            .itemsSummary(request.itemsSummary())
            .build();

        int totalUnits = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (request.items() != null && !request.items().isEmpty()) {
            StringBuilder summary = new StringBuilder();
            for (int i = 0; i < request.items().size(); i++) {
                var itemReq = request.items().get(i);
                Product product = productRepository
                    .findByIdAndTenantIdAndDeletedAtIsNull(itemReq.productId(), tenantId)
                    .orElseThrow(() -> BusinessException.notFound("Producto", itemReq.productId()));

                BigDecimal lineTotal = itemReq.unitPrice()
                    .multiply(BigDecimal.valueOf(itemReq.quantity()));

                CustomerOrderItem item = CustomerOrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getReference())
                    .productCode(product.getCode())
                    .quantity(itemReq.quantity())
                    .unitPrice(itemReq.unitPrice())
                    .total(lineTotal)
                    .build();

                order.addItem(item);
                totalUnits += itemReq.quantity();
                totalAmount = totalAmount.add(lineTotal);

                if (i > 0) summary.append(", ");
                summary.append(product.getReference()).append(" × ").append(itemReq.quantity());
            }

            if (request.itemsSummary() == null || request.itemsSummary().isBlank()) {
                String s = summary.toString();
                order.setItemsSummary(s.length() > 500 ? s.substring(0, 500) : s);
            }
        }

        order.setTotalUnits(totalUnits);
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public CustomerOrderResponse linkSale(Long orderId, Long saleId) {
        Long tenantId = TenantContext.require();
        CustomerOrder order = orderRepository.findByIdAndTenantId(orderId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Pedido", orderId));

        Sale sale = saleRepository.findByIdAndTenantIdWithItems(saleId, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Venta", saleId));

        order.getSales().add(sale);
        recalculate(order);

        return toResponse(order);
    }

    @Transactional
    public CustomerOrderResponse updateStatus(Long id, String status) {
        Long tenantId = TenantContext.require();
        CustomerOrder order = orderRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Pedido", id));
        order.setStatus(status);
        return toResponse(order);
    }

    private void recalculate(CustomerOrder order) {
        int totalUnits = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (CustomerOrderItem item : order.getItems()) {
                totalUnits += item.getQuantity();
                totalAmount = totalAmount.add(item.getTotal());
            }
        } else {
            for (Sale sale : order.getSales()) {
                if (!sale.isCancelled()) {
                    for (SaleItem item : sale.getItems()) {
                        totalUnits += item.getQuantity();
                    }
                    totalAmount = totalAmount.add(sale.getTotal());
                }
            }
        }

        order.setTotalUnits(totalUnits);
        order.setTotalAmount(totalAmount);
    }

    private CustomerOrderResponse toResponse(CustomerOrder o) {
        var saleIds = o.getSales().stream().map(Sale::getId).toList();
        var items = o.getItems() == null ? List.<CustomerOrderItemResponse>of()
            : o.getItems().stream()
                .map(i -> new CustomerOrderItemResponse(
                    i.getId(), i.getProductId(), i.getProductName(), i.getProductCode(),
                    i.getQuantity(), i.getUnitPrice(), i.getTotal()))
                .toList();
        return new CustomerOrderResponse(
            o.getId(), o.getCode(), o.getCustomerId(), o.getCustomerName(),
            o.getDate(), o.getStatus(), o.getPaymentStatus(),
            o.getTotalUnits(), o.getTotalAmount(),
            o.getItemsSummary(), o.getComments(),
            items, saleIds, o.getCreatedAt()
        );
    }
}
