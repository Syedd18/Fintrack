package com.fintrack.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserSettingsUpdateDto {
    private String telegramChatId;
    private Boolean alertsEnabled;
    private Boolean dailySummaryEnabled;
    private BigDecimal monthlyBudget;
    private String currency;
}
