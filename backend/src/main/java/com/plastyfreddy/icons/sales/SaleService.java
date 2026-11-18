package com.plastyfreddy.icons.sales;

import com.plastyfreddy.icons.catalog.StockService;
import com.plastyfreddy.icons.catalog.domain.MovementType;
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

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<SaleResponse> list(String search, Long customerId, String paymentStatus, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<Sale> page;
        if (search != null && !search.isBlank()) {
            page = saleRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (customerId != null) {
            page = saleRepository.findByTenantIdAndCustomerId(tenantId, customerId, pageable);
        } else if (paymentStatus != null) {
            page = saleRepository.findByTenantIdAndPaymentStatus(
                tenantId, PaymentStatus.valueOf(paymentStatus), pageable);
        } else {
            page = saleRepository.findByTenantIdOrderByDateDescCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SaleResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        Sale sale = saleRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Venta", id));
        return toResponse(sale);
    }

    @Transactional
    public SaleResponse create(CreateSaleRequest request) {
        Long tenantId = TenantContext.require();
        String code = sequenceService.nextCode("SALE");

        Sale sale = Sale.builder()
            .code(code)
            .customerId(request.customerId())
            .customerName(request.customerName())
            .date(request.date())
            .notes(request.notes())
            .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (var itemReq : request.items()) {
            Product product = productRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(itemReq.productId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Producto", itemReq.productId()));

            if (product.isBlocked()) {
                throw new BusinessException("El producto '%s' está bloqueado".formatted(product.getReference()));
            }

            BigDecimal lineTotal = product.getSalePrice().multiply(BigDecimal.valueOf(itemReq.quantity()));

            SaleItem item = SaleItem.builder()
                .productId(product.getId())
                .productName(product.getReference())
                .quantity(itemReq.quantity())
                .unitPrice(product.getSalePrice())
                .total(lineTotal)
                .build();
            sale.addItem(item);

            subtotal = subtotal.add(lineTotal);

            stockService.adjustStock(product.getId(), MovementType.SALE_OUT,
                itemReq.quantity(), "SALE", null, "Venta " + code);
        }

        sale.setSubtotal(subtotal);
        sale.setTotal(subtotal);

        BigDecimal amountPaid = request.amountPaid() != null ? request.amountPaid() : BigDecimal.ZERO;
        sale.setAmountPaid(amountPaid);
        sale.setAmountDue(subtotal.subtract(amountPaid));
        sale.setPaymentStatus(resolvePaymentStatus(amountPaid, subtotal));

        sale = saleRepository.save(sale);
        return toResponse(sale);
    }

    @Transactional
    public SaleResponse addPayment(Long id, PaymentRequest request) {
        Long tenantId = TenantContext.require();
        Sale sale = saleRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Venta", id));

        if (sale.isCancelled()) {
            throw new BusinessException("No se puede abonar a una venta cancelada");
        }
        if (sale.getPaymentStatus() == PaymentStatus.PAGADO) {
            throw new BusinessException("La venta ya está pagada");
        }

        BigDecimal newPaid = sale.getAmountPaid().add(request.amount());
        if (newPaid.compareTo(sale.getTotal()) > 0) {
            throw new BusinessException("El monto excede el total de la venta");
        }

        sale.setAmountPaid(newPaid);
        sale.setAmountDue(sale.getTotal().subtract(newPaid));
        sale.setPaymentStatus(resolvePaymentStatus(newPaid, sale.getTotal()));

        return toResponse(sale);
    }

    @Transactional
    public void cancel(Long id) {
        Long tenantId = TenantContext.require();
        Sale sale = saleRepository.findByIdAndTenantIdWithItems(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Venta", id));

        if (sale.isCancelled()) {
            throw new BusinessException("La venta ya está cancelada");
        }

        for (SaleItem item : sale.getItems()) {
            stockService.adjustStock(item.getProductId(), MovementType.RETURN_IN,
                item.getQuantity(), "SALE", sale.getId(),
                "Devolución por cancelación de venta " + sale.getCode());
        }

        sale.cancel();
    }

    private PaymentStatus resolvePaymentStatus(BigDecimal paid, BigDecimal total) {
        if (paid.compareTo(total) >= 0) return PaymentStatus.PAGADO;
        if (paid.compareTo(BigDecimal.ZERO) > 0) return PaymentStatus.PARCIAL;
        return PaymentStatus.NO_PAGADO;
    }

    private SaleResponse toResponse(Sale s) {
        var items = s.getItems().stream()
            .map(i -> new SaleItemResponse(
                i.getId(), i.getProductId(), i.getProductName(),
                i.getQuantity(), i.getUnitPrice(), i.getTotal()))
            .toList();
        return new SaleResponse(
            s.getId(), s.getCode(), s.getCustomerId(), s.getCustomerName(),
            s.getDate(), s.getSubtotal(), s.getTotal(),
            s.getAmountPaid(), s.getAmountDue(),
            s.getPaymentStatus().name(), s.getStatus(), s.getNotes(),
            items, s.getCreatedAt(), s.getCreatedBy()
        );
    }
}
