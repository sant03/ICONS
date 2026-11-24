package com.plastyfreddy.icons.dispatches.domain;

import com.plastyfreddy.icons.shared.tenant.TenantAwareEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "delivery_drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryDriver extends TenantAwareEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String vehicle;

    @Column(length = 20)
    private String plate;

    @Column(length = 100)
    private String zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DriverStatus status = DriverStatus.DISPONIBLE;

    @Column(name = "avatar_initials", length = 5)
    private String avatarInitials;
}
