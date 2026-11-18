package com.plastyfreddy.icons.purchases.domain;

import com.plastyfreddy.icons.shared.tenant.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 150)
    private String supplierName;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(length = 500)
    private String notes;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseItem> items = new ArrayList<>();

    public void addItem(PurchaseItem item) {
        items.add(item);
        item.setPurchase(this);
    }

    public void cancel() {
        this.status = "CANCELLED";
        this.cancelledAt = Instant.now();
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(status);
    }
}
