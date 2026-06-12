package com.fintrack.service;

import com.fintrack.entity.SystemEvent;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.SystemEventRepository;
import com.fintrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReconciliationService {

    private final TransactionRepository transactionRepository;
    private final SystemEventRepository systemEventRepository;

    @Transactional
    public void reconcileBalance(User user, Transaction newTxn) {
        if (newTxn.getBalance() == null) {
            return; // Can't reconcile if SMS didn't have current balance
        }

        // Fetch previous transaction for this specific bank to check mathematical alignment
        Optional<Transaction> latestOpt = transactionRepository.findLatestTransactionByUserId(user.getId());
        if (latestOpt.isEmpty()) {
            return; // First transaction, nothing to compare
        }

        Transaction prevTxn = latestOpt.get();
        if (prevTxn.getId().equals(newTxn.getId())) {
            // Might be comparing against itself if already saved, check if we have a second latest
            // However, typically this is run BEFORE saving or we ignore the self-match.
            return;
        }

        if (prevTxn.getBalance() != null) {
            BigDecimal expectedBal;
            if ("DEBIT".equalsIgnoreCase(newTxn.getCategory()) || "DEBIT".equalsIgnoreCase(newTxn.getTransactionId())) {
                expectedBal = prevTxn.getBalance().subtract(newTxn.getAmount());
            } else {
                expectedBal = prevTxn.getBalance().add(newTxn.getAmount());
            }

            if (expectedBal.compareTo(newTxn.getBalance()) != 0) {
                String detail = String.format(
                        "Balance Mismatch Detected for User: %s, Bank: %s. Expected: ₹%s, Parsed SMS Balance: ₹%s. Transaction ID: %s",
                        user.getEmail(), newTxn.getBank(), expectedBal, newTxn.getBalance(), newTxn.getTransactionId()
                );
                log.warn(detail);

                SystemEvent anomaly = SystemEvent.builder()
                        .eventType("RECONCILIATION_MISMATCH")
                        .status("WARNING")
                        .details(detail)
                        .build();
                systemEventRepository.save(anomaly);
            }
        }
    }
}
