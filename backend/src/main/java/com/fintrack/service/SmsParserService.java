package com.fintrack.service;

import com.fintrack.dto.ParsedTransactionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class SmsParserService {

    private final GeminiService geminiService;

    private static final List<SmsPatternRule> RULES = new ArrayList<>();

    static {
        // HDFC Debit Alert
        // Alert: You've made a txn of Rs. 250.00 at ZOMATO on 01-01-2026 12:00:00. Bal: Rs.24567.32. Ref: UPI123456
        RULES.add(new SmsPatternRule(
                Pattern.compile("(?i)(?:txn of|made a txn of|spent)\\s+(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)\\s+(?:at|to)\\s+([a-zA-Z0-9\\s*_-]+)\\s+on\\s+([\\d-:\\s]+).*?(?:Bal|Balance).*?(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*).*?(?:Ref|txn|UPI):?\\s*([a-zA-Z0-9]+)"),
                "DEBIT", "HDFC"
        ));

        // SBI Debit Alert
        // Your a/c no. XXXXXX1234 debited by Rs.500.00 on 01-01-2026 txn# 1234567 at Swiggy. Bal Rs.12000.00.
        RULES.add(new SmsPatternRule(
                Pattern.compile("(?i)a/c.*?debited by\\s+(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)\\s+on\\s+([\\d-:\\s]+).*?txn#?\\s*([a-zA-Z0-9]+)\\s+(?:at|to)\\s+([a-zA-Z0-9\\s*_-]+).*?Bal\\s+(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)"),
                "DEBIT", "SBI"
        ));

        // ICICI Debit Alert
        // Dear Customer, your Acct XXXXX123 is debited with INR 249.00 on 01-Jan-26. Info: Swiggy. Available Balance is INR 14520.00.
        RULES.add(new SmsPatternRule(
                Pattern.compile("(?i)acct.*?debited with\\s+(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)\\s+on\\s+([a-zA-Z0-9-\\s]+).*?info:\\s*([a-zA-Z0-9\\s*_-]+).*?Balance.*?INR\\s*([\\d,]+\\.?\\d*)"),
                "DEBIT", "ICICI"
        ));

        // Generic UPI Debit Alert (GPay, PhonePe, Paytm, etc.)
        // Paid Rs. 150 to Swiggy from Bank A/c XX1234. Txn Ref: UPI123456. Bal: Rs. 1200.
        RULES.add(new SmsPatternRule(
                Pattern.compile("(?i)(?:paid|sent|spent)\\s+(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)\\s+(?:to|at)\\s+([a-zA-Z0-9\\s*_-]+).*?from\\s+Bank.*?Txn\\s*Ref:?\\s*([a-zA-Z0-9]+).*?(?:Bal|Balance):?\\s*(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)"),
                "DEBIT", "GENERIC_UPI"
        ));

        // Generic UPI Credit Alert
        // Rs.100.00 credited to your A/c XX1234 on 01-01-26. Ref: UPI789012. Bal: Rs.500.
        RULES.add(new SmsPatternRule(
                Pattern.compile("(?i)(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)\\s+credited.*?to.*?A/c.*?on\\s+([a-zA-Z0-9-\\s]+).*?Ref:?\\s*([a-zA-Z0-9]+).*?(?:Bal|Balance):?\\s*(?:Rs\\.?|INR)\\s*([\\d,]+\\.?\\d*)"),
                "CREDIT", "GENERIC_UPI"
        ));
    }

    public ParsedTransactionDto parseSms(String smsText) {
        log.info("Starting parsing for SMS text: {}", smsText);

        for (SmsPatternRule rule : RULES) {
            Matcher m = rule.pattern.matcher(smsText);
            if (m.find()) {
                try {
                    BigDecimal amount = null;
                    String merchant = "Unknown Merchant";
                    String txnId = null;
                    BigDecimal balance = null;
                    OffsetDateTime timestamp = OffsetDateTime.now();

                    // Map values based on specific rule matching
                    if (rule.bank.equals("HDFC")) {
                        amount = parseDecimal(m.group(1));
                        merchant = m.group(2).trim();
                        balance = parseDecimal(m.group(4));
                        txnId = m.group(5);
                    } else if (rule.bank.equals("SBI")) {
                        amount = parseDecimal(m.group(1));
                        txnId = m.group(3);
                        merchant = m.group(4).trim();
                        balance = parseDecimal(m.group(5));
                    } else if (rule.bank.equals("ICICI")) {
                        amount = parseDecimal(m.group(1));
                        merchant = m.group(3).trim();
                        balance = parseDecimal(m.group(4));
                    } else if (rule.bank.equals("GENERIC_UPI") && rule.defaultType.equals("DEBIT")) {
                        amount = parseDecimal(m.group(1));
                        merchant = m.group(2).trim();
                        txnId = m.group(3);
                        balance = parseDecimal(m.group(4));
                    } else if (rule.bank.equals("GENERIC_UPI") && rule.defaultType.equals("CREDIT")) {
                        amount = parseDecimal(m.group(1));
                        txnId = m.group(3);
                        balance = parseDecimal(m.group(4));
                        merchant = "UPI Credit / Deposit";
                    }

                    return ParsedTransactionDto.builder()
                            .amount(amount)
                            .merchant(merchant)
                            .transactionId(txnId)
                            .balance(balance)
                            .bank(rule.bank)
                            .transactionType(rule.defaultType)
                            .timestamp(timestamp)
                            .confidenceScore(0.95)
                            .parserType("REGEX")
                            .build();

                } catch (Exception ex) {
                    log.error("Regex matched but failed to parse groups for Rule: {}, Error: {}", rule.bank, ex.getMessage());
                }
            }
        }

        log.info("Regex patterns failed. Activating Gemini AI fallback parser...");
        return geminiService.parseSmsWithAi(smsText);
    }

    private BigDecimal parseDecimal(String input) {
        if (input == null) return null;
        return new BigDecimal(input.replaceAll("[^\\d.]", ""));
    }

    private static class SmsPatternRule {
        Pattern pattern;
        String defaultType;
        String bank;

        SmsPatternRule(Pattern pattern, String defaultType, String bank) {
            this.pattern = pattern;
            this.defaultType = defaultType;
            this.bank = bank;
        }
    }
}
