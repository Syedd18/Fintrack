package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "merchant_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "merchant_name", nullable = false, unique = true)
    private String merchantName;

    @Column(nullable = false)
    private String category;

    @Column(name = "pattern_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PatternType patternType = PatternType.FUZZY;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public enum PatternType {
        EXACT,
        REGEX,
        FUZZY
    }
}
