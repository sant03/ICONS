package com.plastyfreddy.icons.dispatches;

import com.plastyfreddy.icons.dispatches.domain.*;
import com.plastyfreddy.icons.dispatches.dto.*;
import com.plastyfreddy.icons.sequence.SequenceService;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DispatchService {

    private final DispatchRepository dispatchRepository;
    private final DeliveryDriverRepository driverRepository;
    private final SequenceService sequenceService;

    @Transactional(readOnly = true)
    public Page<DispatchResponse> list(String search, String status, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<Dispatch> page;
        if (search != null && !search.isBlank()) {
            page = dispatchRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (status != null) {
            page = dispatchRepository.findByTenantIdAndStatus(
                tenantId, DispatchStatus.valueOf(status), pageable);
        } else {
            page = dispatchRepository.findByTenantIdOrderByScheduledDateDescCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DispatchResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        Dispatch dispatch = dispatchRepository.findByIdAndTenantIdWithDetails(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Despacho", id));
        return toResponse(dispatch);
    }

    @Transactional
    public DispatchResponse create(CreateDispatchRequest request) {
        Long tenantId = TenantContext.require();
        String code = sequenceService.nextCode("DISPATCH");

        Dispatch dispatch = Dispatch.builder()
            .code(code)
            .orderId(request.orderId())
            .orderNumber(request.orderNumber())
            .client(request.client())
            .address(request.address())
            .phone(request.phone())
            .zone(request.zone())
            .units(request.units())
            .totalAmount(request.totalAmount() != null ? request.totalAmount() : java.math.BigDecimal.ZERO)
            .priority(request.priority() != null ? DispatchPriority.valueOf(request.priority()) : DispatchPriority.NORMAL)
            .scheduledDate(request.scheduledDate())
            .notes(request.notes())
            .build();

        if (request.driverId() != null) {
            DeliveryDriver driver = driverRepository.findByIdAndTenantId(request.driverId(), tenantId)
                .orElseThrow(() -> BusinessException.notFound("Conductor", request.driverId()));
            dispatch.setDriver(driver);
            dispatch.setStatus(DispatchStatus.ASIGNADO);
            dispatch.setAssignedAt(Instant.now());
        }

        DispatchHistory entry = DispatchHistory.builder()
            .event("Despacho creado")
            .actor(CurrentUser.getUsername())
            .build();
        dispatch.addHistory(entry);

        dispatch = dispatchRepository.save(dispatch);
        return toResponse(dispatch);
    }

    @Transactional
    public DispatchResponse assignDriver(Long id, AssignDriverRequest request) {
        Long tenantId = TenantContext.require();
        Dispatch dispatch = dispatchRepository.findByIdAndTenantIdWithDetails(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Despacho", id));

        DeliveryDriver driver = driverRepository.findByIdAndTenantId(request.driverId(), tenantId)
            .orElseThrow(() -> BusinessException.notFound("Conductor", request.driverId()));

        dispatch.setDriver(driver);
        dispatch.setStatus(DispatchStatus.ASIGNADO);
        dispatch.setAssignedAt(Instant.now());

        DispatchHistory entry = DispatchHistory.builder()
            .event("Asignado a " + driver.getName())
            .actor(CurrentUser.getUsername())
            .build();
        dispatch.addHistory(entry);

        return toResponse(dispatch);
    }

    @Transactional
    public DispatchResponse updateStatus(Long id, String status, String rejectionReason) {
        Long tenantId = TenantContext.require();
        Dispatch dispatch = dispatchRepository.findByIdAndTenantIdWithDetails(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Despacho", id));

        DispatchStatus newStatus = DispatchStatus.valueOf(status);
        dispatch.setStatus(newStatus);

        String actor = CurrentUser.getUsername();
        if (dispatch.getDriver() != null &&
            (newStatus == DispatchStatus.EN_CAMINO || newStatus == DispatchStatus.ENTREGADO || newStatus == DispatchStatus.RECHAZADO)) {
            actor = dispatch.getDriver().getName();
        }

        String eventText = switch (newStatus) {
            case EN_CAMINO -> "Domiciliario inició ruta de entrega";
            case ENTREGADO -> "Entrega confirmada";
            case RECHAZADO -> rejectionReason != null ? "Rechazado: " + rejectionReason : "Entrega rechazada";
            default -> "Estado actualizado a " + newStatus;
        };

        if (newStatus == DispatchStatus.RECHAZADO) {
            dispatch.setRejectedByDriver(actor);
            dispatch.setRejectionReason(rejectionReason);
            dispatch.setDriver(null);
            dispatch.setAssignedAt(null);
        }

        DispatchHistory entry = DispatchHistory.builder()
            .event(eventText)
            .actor(actor)
            .build();
        dispatch.addHistory(entry);

        return toResponse(dispatch);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        Dispatch dispatch = dispatchRepository.findByIdAndTenantIdWithDetails(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Despacho", id));
        dispatchRepository.delete(dispatch);
    }

    private DispatchResponse toResponse(Dispatch d) {
        var historyItems = d.getHistory().stream()
            .map(h -> new DispatchHistoryResponse(h.getId(), h.getTimestamp(), h.getEvent(), h.getActor()))
            .toList();

        return new DispatchResponse(
            d.getId(), d.getCode(), d.getOrderId(), d.getOrderNumber(),
            d.getClient(), d.getAddress(), d.getPhone(), d.getZone(),
            d.getUnits(), d.getTotalAmount(),
            d.getDriver() != null ? d.getDriver().getId() : null,
            d.getDriver() != null ? d.getDriver().getName() : null,
            d.getStatus().name(), d.getPriority().name(),
            d.getScheduledDate(), d.getAssignedAt(),
            d.getRejectedByDriver(), d.getRejectionReason(),
            d.getNotes(), historyItems, d.getCreatedAt()
        );
    }
}
