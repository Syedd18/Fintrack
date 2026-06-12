package com.fintrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "event_type", nullable = false)
    private String eventType; // RECONCILIATION_MISMATCH, PARSING_FAILURE, SYSTEM_ERROR

    @Column(nullable = false)
    private String status; // WARNING, ERROR, INFO

    @Column(columnDefinition = "TEXT")
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
