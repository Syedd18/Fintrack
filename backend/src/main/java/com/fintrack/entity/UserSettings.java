package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "telegram_chat_id")
    private String telegramChatId;

    @Column(name = "alerts_enabled", nullable = false)
    @Builder.Default
    private Boolean alertsEnabled = true;

    @Column(name = "daily_summary_enabled", nullable = false)
    @Builder.Default
    private Boolean dailySummaryEnabled = true;

    @Column(name = "monthly_budget")
    @Builder.Default
    private BigDecimal monthlyBudget = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private String currency = "INR";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
