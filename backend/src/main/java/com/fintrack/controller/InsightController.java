package com.fintrack.controller;

import com.fintrack.entity.Insight;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.repository.InsightRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.service.GeminiService;
import com.fintrack.service.TelegramBotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/insights")
@RequiredArgsConstructor
@Tag(name = "Insights", description = "Endpoints for AI-generated financial alerts and observations")
public class InsightController {

    private final UserRepository userRepository;
    private final InsightRepository insightRepository;
    private final TransactionRepository transactionRepository;
    private final GeminiService geminiService;
    private final TelegramBotService telegramBotService;

    @GetMapping
    @Operation(summary = "Get all financial insights", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Page<Insight>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(insightRepository.findByUserId(user.getId(), PageRequest.of(page, size, Sort.by("generatedAt").descending())));
    }

    @PostMapping("/generate")
    @Operation(summary = "Manually trigger AI insights generation", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Insight> triggerInsight(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);

        // Fetch last 30 days of transactions to feed context to Gemini
        OffsetDateTime limitTime = OffsetDateTime.now().minusDays(30);
        List<Transaction> recentTransactions = transactionRepository.findTransactionsInTimeframe(user.getId(), limitTime, OffsetDateTime.now());

        // Summarize context
        Map<String, BigDecimal> categories = recentTransactions.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)));

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("User email: ").append(user.getEmail()).append("\n");
        contextBuilder.append("Here is the total spend categorized for the last 30 days:\n");
        categories.forEach((cat, val) -> contextBuilder.append("- ").append(cat).append(": ₹").append(val).append("\n"));
        
        contextBuilder.append("\nDetailed list of recent transactions:\n");
        recentTransactions.stream().limit(15).forEach(t -> contextBuilder.append(String.format(
                "Merchant: %s, Category: %s, Amount: ₹%s, Time: %s\n",
                t.getMerchant(), t.getCategory(), t.getAmount(), t.getTimestamp()
        )));

        // Invoke Gemini
        String aiOutput = geminiService.generateFinancialInsights(contextBuilder.toString());

        // Split response into Title/Description if possible, or use standard formatting
        String title = "Monthly Spending Summary";
        String description = aiOutput;
        if (aiOutput.contains(":") && aiOutput.indexOf(":") < 40) {
            int splitIdx = aiOutput.indexOf(":");
            title = aiOutput.substring(0, splitIdx).replace("*", "").trim();
            description = aiOutput.substring(splitIdx + 1).trim();
        }

        Insight insight = Insight.builder()
                .user(user)
                .category("SPENDING")
                .title(title)
                .description(description)
                .confidence(BigDecimal.valueOf(95.00))
                .readStatus(false)
                .build();

        Insight saved = insightRepository.save(insight);

        // Send warning/insight via Telegram Bot
        telegramBotService.sendInsightAlert(user, title, description);

        return ResponseEntity.ok(saved);
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}
