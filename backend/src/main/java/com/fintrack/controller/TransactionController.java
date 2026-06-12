package com.fintrack.controller;

import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Transactions", description = "Endpoints for managing the personal ledger database")
public class TransactionController {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    @Operation(summary = "Get paginated user transactions", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Page<Transaction>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        User user = getUser(userDetails);
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(transactionRepository.findByUserId(user.getId(), pageable));
    }

    @PostMapping
    @Operation(summary = "Manually record a transaction", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Transaction> createTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody Transaction request
    ) {
        User user = getUser(userDetails);
        request.setUser(user);
        request.setSource(Transaction.TransactionSource.MANUAL);
        if (request.getTimestamp() == null) {
            request.setTimestamp(OffsetDateTime.now());
        }
        return ResponseEntity.ok(transactionRepository.save(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modify/override a transaction detail", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Transaction> updateTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody Transaction request
    ) {
        User user = getUser(userDetails);
        return transactionRepository.findById(id)
                .map(existing -> {
                    if (!existing.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<Transaction>build();
                    }
                    if (request.getAmount() != null) existing.setAmount(request.getAmount());
                    if (request.getMerchant() != null) existing.setMerchant(request.getMerchant());
                    if (request.getCategory() != null) existing.setCategory(request.getCategory());
                    if (request.getBank() != null) existing.setBank(request.getBank());
                    if (request.getBalance() != null) existing.setBalance(request.getBalance());
                    if (request.getNotes() != null) existing.setNotes(request.getNotes());
                    return ResponseEntity.ok(transactionRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a transaction record", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        User user = getUser(userDetails);
        return transactionRepository.findById(id)
                .map(existing -> {
                    if (!existing.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<Void>build();
                    }
                    transactionRepository.delete(existing);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/export")
    @Operation(summary = "Export all user transactions to CSV file", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        
        // Fetch last 10,000 transactions for export
        Page<Transaction> page = transactionRepository.findByUserId(user.getId(), PageRequest.of(0, 10000, Sort.by("timestamp").descending()));
        List<Transaction> txns = page.getContent();

        StringWriter writer = new StringWriter();
        writer.write("ID,Timestamp,Bank,Merchant,Category,Amount,Balance,Source,Notes\n");

        for (Transaction t : txns) {
            writer.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    t.getId(),
                    t.getTimestamp(),
                    escapeCsvField(t.getBank()),
                    escapeCsvField(t.getMerchant()),
                    escapeCsvField(t.getCategory()),
                    t.getAmount(),
                    t.getBalance() != null ? t.getBalance().toString() : "",
                    t.getSource(),
                    escapeCsvField(t.getNotes() != null ? t.getNotes() : "")
            ));
        }

        byte[] csvBytes = writer.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "fintrack_transactions.csv");

        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}
