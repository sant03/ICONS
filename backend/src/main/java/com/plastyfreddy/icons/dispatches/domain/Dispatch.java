package com.plastyfreddy.icons.dispatches.domain;

import com.plastyfreddy.icons.shared.tenant.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dispatches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispatch extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_number", length = 50)
    private String orderNumber;

    @Column(nullable = false, length = 150)
    private String client;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String zone;

    @Column(nullable = false)
    @Builder.Default
    private int units = 0;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private DeliveryDriver driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DispatchStatus status = DispatchStatus.POR_ASIGNAR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DispatchPriority priority = DispatchPriority.NORMAL;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "rejected_by_driver", length = 150)
    private String rejectedByDriver;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(length = 500)
    private String notes;

    @OneToMany(mappedBy = "dispatch", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<DispatchHistory> history = new ArrayList<>();

    public void addHistory(DispatchHistory entry) {
        history.add(entry);
        entry.setDispatch(this);
    }
}
