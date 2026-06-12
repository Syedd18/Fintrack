package com.fintrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyResponse {
    private UUID id;
    private String keyName;
    private String plainKey; // Only populated on creation
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime expiresAt;
}
