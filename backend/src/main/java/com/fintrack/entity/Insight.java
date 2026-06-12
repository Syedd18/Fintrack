package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insight {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category; // SPENDING, SAVINGS, ALERTS

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal confidence = BigDecimal.valueOf(100.00);

    @Column(name = "read_status", nullable = false)
    @Builder.Default
    private Boolean readStatus = false;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private OffsetDateTime generatedAt;
}
