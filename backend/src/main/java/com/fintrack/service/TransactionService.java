package com.fintrack.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.dto.ParsedTransactionDto;
import com.fintrack.entity.Budget;
import com.fintrack.entity.SmsLog;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.BudgetRepository;
import com.fintrack.repository.SmsLogRepository;
import com.fintrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionService {

    private final SmsParserService smsParserService;
    private final MerchantCategoryService merchantCategoryService;
    private final ReconciliationService reconciliationService;
    private final TelegramBotService telegramBotService;
    
    private final TransactionRepository transactionRepository;
    private final SmsLogRepository smsLogRepository;
    private final BudgetRepository budgetRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public Transaction processIncomingSms(User user, String sender, String rawText) {
        log.info("Processing webhook transaction for user: {}, sender: {}", user.getEmail(), sender);

        ParsedTransactionDto parsed = smsParserService.parseSms(rawText);
        
        // 1. Record raw SMS log
        SmsLog.ParseStatus parseStatus = (parsed.getAmount() != null && parsed.getAmount().compareTo(BigDecimal.ZERO) > 0) 
                ? SmsLog.ParseStatus.PARSED 
                : SmsLog.ParseStatus.FAILED;

        String parsedJsonStr = "";
        try {
            parsedJsonStr = objectMapper.writeValueAsString(parsed);
        } catch (Exception ignored) {}

        SmsLog smsLog = SmsLog.builder()
                .user(user)
                .sender(sender)
                .rawText(rawText)
                .parseStatus(parseStatus)
                .confidenceScore(BigDecimal.valueOf(parsed.getConfidenceScore()))
                .parsedJson(parsedJsonStr)
                .build();
        smsLogRepository.save(smsLog);

        if (parseStatus == SmsLog.ParseStatus.FAILED) {
            log.warn("Failed to parse financial details from SMS: {}", rawText);
            return null;
        }

        // 2. Check for duplicate transactions
        if (parsed.getTransactionId() != null) {
            Optional<Transaction> existing = transactionRepository.findByTransactionId(parsed.getTransactionId());
            if (existing.isPresent()) {
                log.info("Skipping duplicate transaction with reference ID: {}", parsed.getTransactionId());
                return existing.get();
            }
        }

        // 3. Resolve category
        String finalCategory = merchantCategoryService.categorize(parsed.getMerchant());

        // 4. Map and build Transaction entity
        Transaction transaction = Transaction.builder()
                .user(user)
                .amount(parsed.getAmount())
                .bank(parsed.getBank())
                .merchant(parsed.getMerchant())
                .category(finalCategory)
                .timestamp(parsed.getTimestamp())
                .balance(parsed.getBalance())
                .status(Transaction.TransactionStatus.COMPLETED)
                .source(Transaction.TransactionSource.SMS)
                .transactionId(parsed.getTransactionId())
                .notes("Automatically captured via SMS listener")
                .build();

        // 5. Run Reconciliation
        reconciliationService.reconcileBalance(user, transaction);

        // 6. Save transaction
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 7. Check & update budgets
        updateBudgetTrack(user, finalCategory, parsed.getAmount());

        // 8. Fire asynchronous Telegram alert
        telegramBotService.sendTransactionAlert(user, savedTransaction);

        return savedTransaction;
    }

    private void updateBudgetTrack(User user, String category, BigDecimal amount) {
        LocalDate today = LocalDate.now();
        Optional<Budget> activeBudgetOpt = budgetRepository.findActiveBudget(user.getId(), category, today);

        if (activeBudgetOpt.isPresent()) {
            Budget budget = activeBudgetOpt.get();
            budget.setSpent(budget.getSpent().add(amount));
            budgetRepository.save(budget);

            // Trigger warnings if exceeded
            if (budget.getSpent().compareTo(budget.getAmount()) > 0) {
                String warningText = String.format("You have exceeded your monthly budget for category '%s'! Spent: ₹%s / Budget: ₹%s", 
                        category, budget.getSpent(), budget.getAmount());
                telegramBotService.sendInsightAlert(user, "Category Budget Exceeded", warningText);
            }
        }
    }
}
