package com.plastyfreddy.icons.sales;

import com.plastyfreddy.icons.sales.dto.*;
import com.plastyfreddy.icons.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos de clientes")
public class CustomerOrderController {

    private final CustomerOrderService orderService;

    @GetMapping
    @PreAuthorize("hasAuthority('ORDERS_VIEW')")
    @Operation(summary = "Listar pedidos con filtros")
    public ResponseEntity<PageResponse<CustomerOrderResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(
            orderService.list(search, status, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ORDERS_VIEW')")
    @Operation(summary = "Obtener un pedido por ID")
    public ResponseEntity<CustomerOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ORDERS_CREATE')")
    @Operation(summary = "Crear un pedido de cliente")
    public ResponseEntity<CustomerOrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
    }

    @PostMapping("/{orderId}/sales/{saleId}")
    @PreAuthorize("hasAuthority('ORDERS_EDIT')")
    @Operation(summary = "Vincular una venta a un pedido")
    public ResponseEntity<CustomerOrderResponse> linkSale(
            @PathVariable Long orderId,
            @PathVariable Long saleId) {
        return ResponseEntity.ok(orderService.linkSale(orderId, saleId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ORDERS_EDIT')")
    @Operation(summary = "Actualizar estado de un pedido")
    public ResponseEntity<CustomerOrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateStatus(id, body.get("status")));
    }
}
