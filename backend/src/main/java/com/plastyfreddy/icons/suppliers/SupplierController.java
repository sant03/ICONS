package com.plastyfreddy.icons.suppliers;

import com.plastyfreddy.icons.shared.web.PageResponse;
import com.plastyfreddy.icons.suppliers.dto.*;
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
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Proveedores")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasAuthority('SUPPLIERS_VIEW')")
    @Operation(summary = "Listar proveedores con búsqueda")
    public ResponseEntity<PageResponse<SupplierResponse>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(supplierService.list(search, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIERS_VIEW')")
    @Operation(summary = "Obtener un proveedor por ID")
    public ResponseEntity<SupplierResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SUPPLIERS_CREATE')")
    @Operation(summary = "Crear un proveedor (código auto-generado)")
    public ResponseEntity<SupplierResponse> create(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIERS_EDIT')")
    @Operation(summary = "Actualizar un proveedor")
    public ResponseEntity<SupplierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        return ResponseEntity.ok(supplierService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUPPLIERS_DELETE')")
    @Operation(summary = "Eliminar un proveedor (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
