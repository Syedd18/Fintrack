package com.fintrack.service;

import com.fintrack.dto.ParsedTransactionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class SmsParserServiceTest {

    private SmsParserService smsParserService;

    @Mock
    private GeminiService geminiService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        smsParserService = new SmsParserService(geminiService);
    }

    @Test
    public void testParseHdfcDebitSms() {
        String sms = "Alert: You've made a txn of Rs. 250.00 at ZOMATO on 01-01-2026 12:00:00 using HDFC Bank Card/NetBanking. Bal: Rs.24567.32. Ref: UPI123456";
        ParsedTransactionDto result = smsParserService.parseSms(sms);

        assertNotNull(result);
        assertEquals("HDFC", result.getBank());
        assertEquals("DEBIT", result.getTransactionType());
        assertEquals(new BigDecimal("250.00"), result.getAmount());
        assertEquals("ZOMATO", result.getMerchant());
        assertEquals(new BigDecimal("24567.32"), result.getBalance());
        assertEquals("UPI123456", result.getTransactionId());
        assertEquals("REGEX", result.getParserType());
    }

    @Test
    public void testParseSbiDebitSms() {
        String sms = "Your a/c no. XXXXXX1234 debited by Rs.500.00 on 01-01-2026 txn# TXN99304 at Swiggy. Bal Rs.12000.00.";
        ParsedTransactionDto result = smsParserService.parseSms(sms);

        assertNotNull(result);
        assertEquals("SBI", result.getBank());
        assertEquals("DEBIT", result.getTransactionType());
        assertEquals(new BigDecimal("500.00"), result.getAmount());
        assertEquals("Swiggy", result.getMerchant());
        assertEquals(new BigDecimal("12000.00"), result.getBalance());
        assertEquals("TXN99304", result.getTransactionId());
    }

    @Test
    public void testParseGenericDebitSms() {
        String sms = "Paid Rs. 150 to Swiggy from Bank A/c XX1234. Txn Ref: UPI10023. Bal: Rs. 1200.00";
        ParsedTransactionDto result = smsParserService.parseSms(sms);

        assertNotNull(result);
        assertEquals("GENERIC_UPI", result.getBank());
        assertEquals("DEBIT", result.getTransactionType());
        assertEquals(new BigDecimal("150"), result.getAmount());
        assertEquals("Swiggy", result.getMerchant());
        assertEquals(new BigDecimal("1200.00"), result.getBalance());
        assertEquals("UPI10023", result.getTransactionId());
    }
}
