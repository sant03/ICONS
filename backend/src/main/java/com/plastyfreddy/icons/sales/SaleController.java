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
@RequestMapping("/sales")
@RequiredArgsConstructor
@Tag(name = "Ventas")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    @Operation(summary = "Listar ventas con filtros")
    public ResponseEntity<PageResponse<SaleResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String paymentStatus,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(
            saleService.list(search, customerId, paymentStatus, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    @Operation(summary = "Obtener una venta con sus ítems")
    public ResponseEntity<SaleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Operation(summary = "Registrar una venta (descuenta stock automáticamente)")
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody CreateSaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.create(request));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAuthority('SALES_EDIT')")
    @Operation(summary = "Registrar un abono a una venta")
    public ResponseEntity<SaleResponse> addPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(saleService.addPayment(id, request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('SALES_CANCEL')")
    @Operation(summary = "Cancelar una venta (devuelve stock)")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        saleService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
