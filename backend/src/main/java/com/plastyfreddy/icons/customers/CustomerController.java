package com.plastyfreddy.icons.customers;

import com.plastyfreddy.icons.customers.dto.*;
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
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Clientes")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAuthority('CUSTOMERS_VIEW')")
    @Operation(summary = "Listar clientes con búsqueda")
    public ResponseEntity<PageResponse<CustomerResponse>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(customerService.list(search, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMERS_VIEW')")
    @Operation(summary = "Obtener un cliente por ID")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMERS_CREATE')")
    @Operation(summary = "Crear un cliente")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMERS_EDIT')")
    @Operation(summary = "Actualizar un cliente")
    public ResponseEntity<CustomerResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMERS_DELETE')")
    @Operation(summary = "Eliminar un cliente (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
