package com.plastyfreddy.icons.purchases;

import com.plastyfreddy.icons.purchases.dto.CreatePurchaseOrderRequest;
import com.plastyfreddy.icons.purchases.dto.PurchaseOrderResponse;
import com.plastyfreddy.icons.shared.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService orderService;

    @GetMapping
    @PreAuthorize("hasAuthority('PURCHASE_ORDERS_VIEW')")
    public PageResponse<PurchaseOrderResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return PageResponse.from(orderService.list(search, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_ORDERS_VIEW')")
    public PurchaseOrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PURCHASE_ORDERS_CREATE')")
    public PurchaseOrderResponse create(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        return orderService.create(request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PURCHASE_ORDERS_EDIT')")
    public PurchaseOrderResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return orderService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('PURCHASE_ORDER_DELETE')")
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }
}
