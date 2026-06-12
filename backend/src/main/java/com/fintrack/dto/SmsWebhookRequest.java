package com.fintrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmsWebhookRequest {

    @NotBlank(message = "Sender cannot be blank")
    private String sender;

    @NotBlank(message = "SMS body text cannot be blank")
    private String text;

    private Long timestamp;
}
