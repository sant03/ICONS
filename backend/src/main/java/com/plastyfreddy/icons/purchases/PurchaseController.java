package com.plastyfreddy.icons.purchases;

import com.plastyfreddy.icons.purchases.dto.*;
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
@RequestMapping("/purchases")
@RequiredArgsConstructor
@Tag(name = "Compras")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @GetMapping
    @PreAuthorize("hasAuthority('PURCHASES_VIEW')")
    @Operation(summary = "Listar compras con búsqueda")
    public ResponseEntity<PageResponse<PurchaseResponse>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(purchaseService.list(search, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PURCHASES_VIEW')")
    @Operation(summary = "Obtener una compra con sus ítems")
    public ResponseEntity<PurchaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PURCHASES_CREATE')")
    @Operation(summary = "Registrar una compra (incrementa stock automáticamente)")
    public ResponseEntity<PurchaseResponse> create(@Valid @RequestBody CreatePurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.create(request));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('PURCHASES_CANCEL')")
    @Operation(summary = "Cancelar una compra (revierte stock)")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        purchaseService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
