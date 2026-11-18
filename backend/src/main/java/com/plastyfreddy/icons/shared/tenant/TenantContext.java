package com.plastyfreddy.icons.shared.tenant;

public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {}

    public static void set(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long get() {
        return CURRENT_TENANT.get();
    }

    public static Long require() {
        Long id = CURRENT_TENANT.get();
        if (id == null) {
            throw new IllegalStateException("Tenant no establecido en el contexto actual");
        }
        return id;
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
