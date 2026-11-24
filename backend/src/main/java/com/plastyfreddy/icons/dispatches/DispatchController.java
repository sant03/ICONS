package com.plastyfreddy.icons.dispatches;

import com.plastyfreddy.icons.dispatches.dto.AssignDriverRequest;
import com.plastyfreddy.icons.dispatches.dto.CreateDispatchRequest;
import com.plastyfreddy.icons.dispatches.dto.DispatchResponse;
import com.plastyfreddy.icons.shared.web.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dispatches")
@RequiredArgsConstructor
public class DispatchController {

    private final DispatchService dispatchService;

    @GetMapping
    @PreAuthorize("hasAuthority('DISPATCH_VIEW')")
    public PageResponse<DispatchResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return PageResponse.from(dispatchService.list(search, status, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DISPATCH_VIEW')")
    public DispatchResponse getById(@PathVariable Long id) {
        return dispatchService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('DISPATCH_CREATE')")
    public DispatchResponse create(@Valid @RequestBody CreateDispatchRequest request) {
        return dispatchService.create(request);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('DISPATCH_EDIT')")
    public DispatchResponse assignDriver(
            @PathVariable Long id,
            @Valid @RequestBody AssignDriverRequest request) {
        return dispatchService.assignDriver(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('DISPATCH_EDIT')")
    public DispatchResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return dispatchService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('DISPATCH_DELETE')")
    public void delete(@PathVariable Long id) {
        dispatchService.delete(id);
    }
}
