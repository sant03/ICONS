package com.plastyfreddy.icons.dispatches;

import com.plastyfreddy.icons.dispatches.dto.CreateDriverRequest;
import com.plastyfreddy.icons.dispatches.dto.DeliveryDriverResponse;
import com.plastyfreddy.icons.dispatches.dto.UpdateDriverRequest;
import com.plastyfreddy.icons.shared.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/drivers")
@RequiredArgsConstructor
public class DeliveryDriverController {

    private final DeliveryDriverService driverService;

    @GetMapping
    @PreAuthorize("hasAuthority('DRIVER_VIEW')")
    public PageResponse<DeliveryDriverResponse> list(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return PageResponse.from(driverService.list(status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DRIVER_VIEW')")
    public DeliveryDriverResponse getById(@PathVariable Long id) {
        return driverService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('DRIVER_CREATE')")
    public DeliveryDriverResponse create(@Valid @RequestBody CreateDriverRequest request) {
        return driverService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DRIVER_EDIT')")
    public DeliveryDriverResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDriverRequest request) {
        return driverService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('DRIVER_DELETE')")
    public void delete(@PathVariable Long id) {
        driverService.delete(id);
    }
}
