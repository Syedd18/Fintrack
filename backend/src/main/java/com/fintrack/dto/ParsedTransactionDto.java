package com.fintrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransactionDto {
    private BigDecimal amount;
    private String merchant;
    private String transactionId;
    private BigDecimal balance;
    private String bank;
    private String transactionType; // DEBIT, CREDIT, UNKNOWN
    private OffsetDateTime timestamp;
    private Double confidenceScore; // 0.00 to 1.00
    private String parserType; // REGEX, AI, FALLBACK_RULE
}
