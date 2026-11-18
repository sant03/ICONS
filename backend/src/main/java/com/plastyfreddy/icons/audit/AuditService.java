package com.plastyfreddy.icons.audit;

import com.plastyfreddy.icons.audit.domain.AuditLog;
import com.plastyfreddy.icons.audit.domain.AuditLogRepository;
import com.plastyfreddy.icons.audit.dto.AuditLogResponse;
import com.plastyfreddy.icons.shared.security.CurrentUser;
import com.plastyfreddy.icons.shared.tenant.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditRepository;

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> list(String search, String category, Pageable pageable) {
        Long tenantId = TenantContext.require();

        Page<AuditLog> page;
        if (search != null && !search.isBlank()) {
            page = auditRepository.searchByTenantId(tenantId, search.trim(), pageable);
        } else if (category != null && !category.isBlank()) {
            page = auditRepository.findByTenantIdAndCategoryOrderByCreatedAtDesc(tenantId, category, pageable);
        } else {
            page = auditRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional
    public void log(String action, String category, String description) {
        log(action, category, null, null, description, null);
    }

    @Transactional
    public void log(String action, String category, String entityType, Long entityId,
                    String description, HttpServletRequest request) {
        Long tenantId = TenantContext.require();

        AuditLog entry = AuditLog.builder()
            .tenantId(tenantId)
            .userId(CurrentUser.getUserId())
            .username(CurrentUser.getUsername())
            .action(action)
            .category(category)
            .entityType(entityType)
            .entityId(entityId)
            .description(description)
            .ipAddress(request != null ? extractIp(request) : null)
            .build();

        auditRepository.save(entry);
    }

    @Transactional
    public void clearAll() {
        Long tenantId = TenantContext.require();
        auditRepository.deleteAllByTenantId(tenantId);
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return new AuditLogResponse(
            a.getId(), a.getUserId(), a.getUsername(),
            a.getAction(), a.getCategory(), a.getEntityType(),
            a.getEntityId(), a.getDescription(), a.getIpAddress(),
            a.getCreatedAt()
        );
    }
}
