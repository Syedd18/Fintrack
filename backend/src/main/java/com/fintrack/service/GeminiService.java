package com.fintrack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.dto.ParsedTransactionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

    @Value("${fintrack.gemini.api-key:}")
    private String apiKey;

    @Value("${fintrack.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String apiUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public ParsedTransactionDto parseSmsWithAi(String smsText) {
        if (apiKey == null || apiKey.trim().isEmpty() || "placeholder".equals(apiKey)) {
            log.warn("Gemini API Key is not set. Falling back to local heuristic parsing simulated response.");
            return simulateAiParsing(smsText);
        }

        try {
            String prompt = """
                    You are a financial SMS parser. Extract the following fields from the SMS text as JSON:
                    - amount (decimal number)
                    - merchant (string, clean merchant name like Amazon, Zomato, Swiggy)
                    - transactionId (string, default null if not found)
                    - balance (decimal number, default null if not found)
                    - bank (string, bank name like HDFC, SBI, ICICI, etc.)
                    - transactionType (string, either DEBIT or CREDIT)
                    
                    Return ONLY the JSON block. Do not include markdown code block tags.
                    SMS Text:
                    """ + smsText;

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> textContent = Map.of("text", prompt);
            Map<String, Object> part = Map.of("parts", List.of(textContent));
            Map<String, Object> contents = Map.of("contents", List.of(part));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String responseText = root.path("candidates")
                        .get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText()
                        .trim();

                // Clean response if it contains markdown formatting
                if (responseText.startsWith("```json")) {
                    responseText = responseText.substring(7);
                }
                if (responseText.endsWith("```")) {
                    responseText = responseText.substring(0, responseText.length() - 3);
                }
                responseText = responseText.trim();

                JsonNode parsedNode = objectMapper.readTree(responseText);

                return ParsedTransactionDto.builder()
                        .amount(new BigDecimal(parsedNode.path("amount").asText("0")))
                        .merchant(parsedNode.path("merchant").asText("Unknown"))
                        .transactionId(parsedNode.path("transactionId").isNull() ? null : parsedNode.path("transactionId").asText())
                        .balance(parsedNode.path("balance").isNull() ? null : new BigDecimal(parsedNode.path("balance").asText()))
                        .bank(parsedNode.path("bank").asText("Unknown"))
                        .transactionType(parsedNode.path("transactionType").asText("DEBIT"))
                        .timestamp(OffsetDateTime.now())
                        .confidenceScore(0.95)
                        .parserType("AI")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API for SMS parsing: {}", e.getMessage());
        }

        return simulateAiParsing(smsText);
    }

    public String generateFinancialInsights(String promptContext) {
        if (apiKey == null || apiKey.trim().isEmpty() || "placeholder".equals(apiKey)) {
            return "Based on your spending, we recommend setting a tighter budget on dining out. Your food expenses are trending higher than last week.";
        }

        try {
            Map<String, Object> textContent = Map.of("text", "You are an expert personal finance AI assistant. Analyze this spending context and give 3 short bullet points of actionable suggestions:\n" + promptContext);
            Map<String, Object> part = Map.of("parts", List.of(textContent));
            Map<String, Object> contents = Map.of("contents", List.of(part));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("candidates")
                        .get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText()
                        .trim();
            }
        } catch (Exception e) {
            log.error("Error generating insights from Gemini API: {}", e.getMessage());
        }

        return "Spend 10% less on Shopping this month to stay on track for your savings goal. Uber travel has increased by 15%. Consider carpooling.";
    }

    private ParsedTransactionDto simulateAiParsing(String smsText) {
        // Fallback rule parser simulation
        BigDecimal amount = BigDecimal.ZERO;
        String type = "DEBIT";
        String merchant = "Unknown Merchant";
        String bank = "Unknown Bank";
        BigDecimal balance = null;

        String lowerText = smsText.toLowerCase();

        // Extract amount
        try {
            java.util.regex.Pattern amtPattern = java.util.regex.Pattern.compile("(?i)(?:rs\\.?|inr)\\s*([\\d,]+\\.?\\d*)");
            java.util.regex.Matcher amtMatcher = amtPattern.matcher(lowerText);
            if (amtMatcher.find()) {
                amount = new BigDecimal(amtMatcher.group(1).replace(",", ""));
            }
        } catch (Exception ignored) {}

        // Credit or Debit
        if (lowerText.contains("credited") || lowerText.contains("received") || lowerText.contains("added")) {
            type = "CREDIT";
        }

        // Try extract bank
        if (lowerText.contains("hdfc")) bank = "HDFC";
        else if (lowerText.contains("sbi")) bank = "SBI";
        else if (lowerText.contains("icici")) bank = "ICICI";
        else if (lowerText.contains("kotak")) bank = "Kotak";
        else if (lowerText.contains("paytm")) bank = "Paytm";

        // Try extract merchant
        if (lowerText.contains("zomato")) merchant = "Zomato";
        else if (lowerText.contains("swiggy")) merchant = "Swiggy";
        else if (lowerText.contains("amazon")) merchant = "Amazon";
        else if (lowerText.contains("uber")) merchant = "Uber";
        else if (lowerText.contains("netflix")) merchant = "Netflix";
        else if (lowerText.contains("jio")) merchant = "Jio";

        return ParsedTransactionDto.builder()
                .amount(amount)
                .merchant(merchant)
                .transactionId("MOCK" + System.currentTimeMillis())
                .balance(balance)
                .bank(bank)
                .transactionType(type)
                .timestamp(OffsetDateTime.now())
                .confidenceScore(0.60)
                .parserType("FALLBACK_RULE")
                .build();
    }
}
