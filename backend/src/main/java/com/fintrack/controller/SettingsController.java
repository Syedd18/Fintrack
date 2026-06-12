package com.fintrack.controller;

import com.fintrack.dto.ApiKeyResponse;
import com.fintrack.dto.UserSettingsUpdateDto;
import com.fintrack.entity.ApiKey;
import com.fintrack.entity.User;
import com.fintrack.entity.UserSettings;
import com.fintrack.repository.ApiKeyRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.repository.UserSettingsRepository;
import com.fintrack.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Settings & Keys", description = "Endpoints for user preferences and API key configurations")
public class SettingsController {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get user settings configuration", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserSettings> getSettings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(user.getSettings());
    }

    @PutMapping
    @Operation(summary = "Update user settings", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<UserSettings> updateSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserSettingsUpdateDto updateDto,
            HttpServletRequest request
    ) {
        User user = getUser(userDetails);
        UserSettings settings = user.getSettings();

        if (updateDto.getTelegramChatId() != null) settings.setTelegramChatId(updateDto.getTelegramChatId());
        if (updateDto.getAlertsEnabled() != null) settings.setAlertsEnabled(updateDto.getAlertsEnabled());
        if (updateDto.getDailySummaryEnabled() != null) settings.setDailySummaryEnabled(updateDto.getDailySummaryEnabled());
        if (updateDto.getMonthlyBudget() != null) settings.setMonthlyBudget(updateDto.getMonthlyBudget());
        if (updateDto.getCurrency() != null) settings.setCurrency(updateDto.getCurrency());

        UserSettings saved = userSettingsRepository.save(settings);
        auditLogService.log(user, "UPDATE_SETTINGS", "Updated notifications & limits config", request.getRemoteAddr());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/api-keys")
    @Operation(summary = "List all API keys", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<ApiKeyResponse>> listApiKeys(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<ApiKey> keys = apiKeyRepository.findByUserId(user.getId());
        List<ApiKeyResponse> responses = keys.stream()
                .map(key -> ApiKeyResponse.builder()
                        .id(key.getId())
                        .keyName(key.getKeyName())
                        .status(key.getStatus().name())
                        .createdAt(key.getCreatedAt())
                        .expiresAt(key.getExpiresAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/api-keys")
    @Operation(summary = "Generate a new API key", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ApiKeyResponse> generateApiKey(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String keyName,
            HttpServletRequest request
    ) {
        User user = getUser(userDetails);

        // Generate clean random string credentials
        byte[] randomBytes = new byte[24];
        new SecureRandom().nextBytes(randomBytes);
        String rawKey = "ft_live_" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String hash = hashKey(rawKey);

        ApiKey apiKey = ApiKey.builder()
                .user(user)
                .keyName(keyName)
                .keyHash(hash)
                .status(ApiKey.KeyStatus.ACTIVE)
                .expiresAt(OffsetDateTime.now().plusYears(1)) // Valid for 1 year
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);
        auditLogService.log(user, "CREATE_API_KEY", "Generated API key: " + keyName, request.getRemoteAddr());

        return ResponseEntity.ok(ApiKeyResponse.builder()
                .id(saved.getId())
                .keyName(saved.getKeyName())
                .plainKey(rawKey) // Returned only on creation!
                .status(saved.getStatus().name())
                .createdAt(saved.getCreatedAt())
                .expiresAt(saved.getExpiresAt())
                .build());
    }

    @DeleteMapping("/api-keys/{id}")
    @Operation(summary = "Revoke / delete an API key", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> revokeApiKey(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            HttpServletRequest request
    ) {
        User user = getUser(userDetails);
        return apiKeyRepository.findById(id)
                .map(key -> {
                    if (!key.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<Void>build();
                    }
                    apiKeyRepository.delete(key);
                    auditLogService.log(user, "REVOKE_API_KEY", "Revoked key: " + key.getKeyName(), request.getRemoteAddr());
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    private String hashKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Error hashing API key", ex);
        }
    }
}
