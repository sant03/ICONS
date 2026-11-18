package com.plastyfreddy.icons.sales;

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

@Service
@RequiredArgsConstructor
public class CustomerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final SaleRepository saleRepository;
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
        String code = sequenceService.nextCode("ORDER");

        CustomerOrder order = CustomerOrder.builder()
            .code(code)
            .customerId(request.customerId())
            .customerName(request.customerName())
            .date(request.date())
            .itemsSummary(request.itemsSummary())
            .build();

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

        for (Sale sale : order.getSales()) {
            if (!sale.isCancelled()) {
                for (SaleItem item : sale.getItems()) {
                    totalUnits += item.getQuantity();
                }
                totalAmount = totalAmount.add(sale.getTotal());
            }
        }

        order.setTotalUnits(totalUnits);
        order.setTotalAmount(totalAmount);
    }

    private CustomerOrderResponse toResponse(CustomerOrder o) {
        var saleIds = o.getSales().stream().map(Sale::getId).toList();
        return new CustomerOrderResponse(
            o.getId(), o.getCode(), o.getCustomerId(), o.getCustomerName(),
            o.getDate(), o.getStatus(), o.getTotalUnits(), o.getTotalAmount(),
            o.getItemsSummary(), saleIds, o.getCreatedAt()
        );
    }
}
