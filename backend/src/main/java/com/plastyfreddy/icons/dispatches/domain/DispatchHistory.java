package com.plastyfreddy.icons.dispatches.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "dispatch_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_id", nullable = false)
    private Dispatch dispatch;

    @Column(nullable = false)
    @Builder.Default
    private Instant timestamp = Instant.now();

    @Column(nullable = false, length = 300)
    private String event;

    @Column(nullable = false, length = 150)
    private String actor;
}
