package com.plastyfreddy.icons.purchases.domain;

import com.plastyfreddy.icons.shared.tenant.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 150)
    private String supplierName;

    @Column(name = "supplier_address", length = 300)
    private String supplierAddress;

    @Column(name = "supplier_phone", length = 20)
    private String supplierPhone;

    @Column(name = "supplier_email", length = 150)
    private String supplierEmail;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "made_on", nullable = false)
    private LocalDate madeOn;

    @Column(name = "reception_date")
    private LocalDate receptionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PurchaseOrderStatus status = PurchaseOrderStatus.DISPONIBLE;

    @Column(name = "made_by", nullable = false, length = 150)
    private String madeBy;

    @Column(name = "user_username", nullable = false, length = 50)
    private String userUsername;

    @Column(length = 100)
    private String area;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "total_products", nullable = false)
    @Builder.Default
    private int totalProducts = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "approved_by", length = 150)
    private String approvedBy;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseOrderItem> items = new ArrayList<>();

    public void addItem(PurchaseOrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }
}
