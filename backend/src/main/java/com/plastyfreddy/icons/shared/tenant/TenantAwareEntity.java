package com.plastyfreddy.icons.shared.tenant;

import com.plastyfreddy.icons.shared.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class TenantAwareEntity extends AuditableEntity {

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;

    @PrePersist
    protected void setTenantOnCreate() {
        if (tenantId == null) {
            tenantId = TenantContext.require();
        }
    }
}
