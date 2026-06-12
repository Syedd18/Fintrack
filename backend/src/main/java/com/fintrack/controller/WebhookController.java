package com.fintrack.controller;

import com.fintrack.dto.SmsWebhookRequest;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhook")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhook", description = "Endpoints for receiving transaction SMS data")
public class WebhookController {

    private final UserRepository userRepository;
    private final TransactionService transactionService;

    @PostMapping("/sms")
    @Operation(summary = "Receive raw transaction SMS", security = @SecurityRequirement(name = "ApiKey"))
    public ResponseEntity<?> receiveSmsWebhook(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SmsWebhookRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Authentication details missing from context.");
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found in database"));

        Transaction processedTxn = transactionService.processIncomingSms(user, request.getSender(), request.getText());
        
        if (processedTxn == null) {
            return ResponseEntity.badRequest().body("SMS body did not match financial transaction profiles or parsing failed.");
        }

        return ResponseEntity.ok(processedTxn);
    }
}
