package com.fintrack.service;

import com.fintrack.entity.NotificationLog;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class TelegramBotService {

    @Value("${fintrack.telegram.bot-token:placeholder_token}")
    private String botToken;

    @Value("${fintrack.telegram.chat-id:placeholder_chat_id}")
    private String defaultChatId;

    private final NotificationLogRepository notificationLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendTransactionAlert(User user, Transaction txn) {
        String chatId = (user.getSettings() != null && user.getSettings().getTelegramChatId() != null)
                ? user.getSettings().getTelegramChatId()
                : defaultChatId;

        if (chatId == null || chatId.isEmpty() || "placeholder_chat_id".equals(chatId)) {
            log.info("[MOCK TELEGRAM ALERT] User: {}, Alert: Txn of ₹{} at {} on bank {}. Balance: ₹{}",
                    user.getEmail(), txn.getAmount(), txn.getMerchant(), txn.getBank(), txn.getBalance());
            saveLog(user, chatId, "MOCK: Transaction Alert", "SENT", null);
            return;
        }

        String typeEmoji = txn.getStatus() == Transaction.TransactionStatus.FAILED ? "❌" :
                (txn.getAmount().compareTo(java.math.BigDecimal.ZERO) < 0 || "DEBIT".equalsIgnoreCase(txn.getCategory()) ? "💸" : "💰");
        if (txn.getCategory().equalsIgnoreCase("Food")) typeEmoji = "🍔";
        else if (txn.getCategory().equalsIgnoreCase("Travel")) typeEmoji = "🚗";
        else if (txn.getCategory().equalsIgnoreCase("Shopping")) typeEmoji = "🛍️";
        else if (txn.getCategory().equalsIgnoreCase("Bills")) typeEmoji = "📱";

        String text = String.format(
                "%s *%s Transaction*\n\n" +
                "*Amount:* ₹%s\n" +
                "*Merchant:* %s\n" +
                "*Category:* %s\n" +
                "*Bank:* %s\n" +
                "*Balance:* ₹%s\n" +
                "*Time:* %s\n" +
                "*ID:* `%s`",
                typeEmoji,
                txn.getAmount().compareTo(java.math.BigDecimal.ZERO) >= 0 ? "Debit" : "Credit",
                txn.getAmount().abs().toString(),
                txn.getMerchant(),
                txn.getCategory(),
                txn.getBank(),
                txn.getBalance() != null ? txn.getBalance().toString() : "N/A",
                txn.getTimestamp().toString(),
                txn.getTransactionId() != null ? txn.getTransactionId() : "N/A"
        );

        sendTelegramMessage(user, chatId, text);
    }

    @Async
    public void sendInsightAlert(User user, String title, String description) {
        String chatId = (user.getSettings() != null && user.getSettings().getTelegramChatId() != null)
                ? user.getSettings().getTelegramChatId()
                : defaultChatId;

        if (chatId == null || chatId.isEmpty() || "placeholder_chat_id".equals(chatId)) {
            log.info("[MOCK TELEGRAM INSIGHT] Title: {}, Description: {}", title, description);
            saveLog(user, chatId, "MOCK: " + title, "SENT", null);
            return;
        }

        String text = String.format(
                "💡 *AI Financial Insight: %s*\n\n" +
                "%s",
                title,
                description
        );

        sendTelegramMessage(user, chatId, text);
    }

    private void sendTelegramMessage(User user, String chatId, String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", chatId);
            request.put("text", text);
            request.put("parse_mode", "Markdown");

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                saveLog(user, chatId, text, "SENT", null);
            } else {
                saveLog(user, chatId, text, "FAILED", "HTTP Status: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            log.error("Failed to send Telegram message: {}", ex.getMessage());
            saveLog(user, chatId, text, "FAILED", ex.getMessage());
        }
    }

    private void saveLog(User user, String destination, String content, String status, String error) {
        try {
            NotificationLog logEntity = NotificationLog.builder()
                    .user(user)
                    .channel("TELEGRAM")
                    .destination(destination)
                    .content(content)
                    .status(status)
                    .errorMessage(error)
                    .build();
            notificationLogRepository.save(logEntity);
        } catch (Exception ex) {
            log.error("Failed to persist notification log: {}", ex.getMessage());
        }
    }
}
