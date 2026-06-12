package com.fintrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshRequest {
    @NotBlank(message = "Refresh token cannot be blank")
    private String refreshToken;
}
