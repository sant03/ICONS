package com.plastyfreddy.icons.catalog;

import com.plastyfreddy.icons.catalog.domain.MovementType;
import com.plastyfreddy.icons.catalog.dto.*;
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
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Productos")
public class ProductController {

    private final ProductService productService;
    private final StockService stockService;

    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCTS_VIEW')")
    @Operation(summary = "Listar productos con búsqueda y filtro por categoría")
    public ResponseEntity<PageResponse<ProductResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 20, sort = "reference") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(
            productService.list(search, categoryId, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_VIEW')")
    @Operation(summary = "Obtener un producto por ID")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCTS_CREATE')")
    @Operation(summary = "Crear un producto (código auto-generado)")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_EDIT')")
    @Operation(summary = "Actualizar un producto")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCTS_DELETE')")
    @Operation(summary = "Eliminar un producto (soft delete, solo si stock = 0)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-block")
    @PreAuthorize("hasAuthority('PRODUCTS_EDIT')")
    @Operation(summary = "Bloquear/desbloquear un producto")
    public ResponseEntity<Void> toggleBlock(@PathVariable Long id) {
        productService.toggleBlock(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/stock-adjustment")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    @Operation(summary = "Ajustar stock manualmente")
    public ResponseEntity<Void> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest request) {
        MovementType type = MovementType.valueOf(request.type());
        stockService.adjustStock(id, type, request.quantity(), null, null, request.notes());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/movements")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    @Operation(summary = "Ver kardex (movimientos de stock) de un producto")
    public ResponseEntity<PageResponse<StockMovementResponse>> getMovements(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(stockService.getMovements(id, pageable));
    }
}
