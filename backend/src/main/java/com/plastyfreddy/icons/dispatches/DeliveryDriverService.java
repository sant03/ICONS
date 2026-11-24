package com.plastyfreddy.icons.dispatches;

import com.plastyfreddy.icons.dispatches.domain.DeliveryDriver;
import com.plastyfreddy.icons.dispatches.domain.DeliveryDriverRepository;
import com.plastyfreddy.icons.dispatches.domain.DriverStatus;
import com.plastyfreddy.icons.dispatches.dto.CreateDriverRequest;
import com.plastyfreddy.icons.dispatches.dto.DeliveryDriverResponse;
import com.plastyfreddy.icons.dispatches.dto.UpdateDriverRequest;
import com.plastyfreddy.icons.shared.exception.BusinessException;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeliveryDriverService {

    private final DeliveryDriverRepository driverRepository;

    @Transactional(readOnly = true)
    public Page<DeliveryDriverResponse> list(String status, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<DeliveryDriver> page;
        if (status != null) {
            page = driverRepository.findByTenantIdAndStatus(
                tenantId, DriverStatus.valueOf(status), pageable);
        } else {
            page = driverRepository.findByTenantIdOrderByNameAsc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DeliveryDriverResponse getById(Long id) {
        Long tenantId = TenantContext.require();
        DeliveryDriver driver = driverRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Conductor", id));
        return toResponse(driver);
    }

    @Transactional
    public DeliveryDriverResponse create(CreateDriverRequest request) {
        String initials = buildInitials(request.name());

        DeliveryDriver driver = DeliveryDriver.builder()
            .name(request.name())
            .phone(request.phone())
            .vehicle(request.vehicle())
            .plate(request.plate())
            .zone(request.zone())
            .avatarInitials(initials)
            .build();

        driver = driverRepository.save(driver);
        return toResponse(driver);
    }

    @Transactional
    public DeliveryDriverResponse update(Long id, UpdateDriverRequest request) {
        Long tenantId = TenantContext.require();
        DeliveryDriver driver = driverRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Conductor", id));

        if (request.name() != null) {
            driver.setName(request.name());
            driver.setAvatarInitials(buildInitials(request.name()));
        }
        if (request.phone() != null) driver.setPhone(request.phone());
        if (request.vehicle() != null) driver.setVehicle(request.vehicle());
        if (request.plate() != null) driver.setPlate(request.plate());
        if (request.zone() != null) driver.setZone(request.zone());
        if (request.status() != null) driver.setStatus(DriverStatus.valueOf(request.status()));

        return toResponse(driver);
    }

    @Transactional
    public void delete(Long id) {
        Long tenantId = TenantContext.require();
        DeliveryDriver driver = driverRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> BusinessException.notFound("Conductor", id));
        driverRepository.delete(driver);
    }

    private DeliveryDriverResponse toResponse(DeliveryDriver d) {
        return new DeliveryDriverResponse(
            d.getId(), d.getName(), d.getPhone(), d.getVehicle(),
            d.getPlate(), d.getZone(), d.getStatus().name(),
            d.getAvatarInitials(), d.getCreatedAt()
        );
    }

    private String buildInitials(String name) {
        if (name == null || name.isBlank()) return "??";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}
