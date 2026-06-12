package com.fintrack.controller;

import com.fintrack.entity.Budget;
import com.fintrack.entity.User;
import com.fintrack.repository.UserRepository;
import com.fintrack.repository.BudgetRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Endpoints for creating category spending limits")
public class BudgetController {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;

    @GetMapping
    @Operation(summary = "Get all budgets for user", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<List<Budget>> getBudgets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(budgetRepository.findByUserId(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create or update budget limits", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Budget> saveBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody Budget budget
    ) {
        User user = getUser(userDetails);
        budget.setUser(user);
        
        if (budget.getStartDate() == null) {
            budget.setStartDate(LocalDate.now().withDayOfMonth(1));
        }
        if (budget.getEndDate() == null) {
            budget.setEndDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()));
        }

        // Check if there is an existing budget for this category & period
        return budgetRepository.findActiveBudget(user.getId(), budget.getCategory(), budget.getStartDate())
                .map(existing -> {
                    existing.setAmount(budget.getAmount());
                    return ResponseEntity.ok(budgetRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.ok(budgetRepository.save(budget)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke budget limit", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id
    ) {
        User user = getUser(userDetails);
        return budgetRepository.findById(id)
                .map(budget -> {
                    if (!budget.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<Void>build();
                    }
                    budgetRepository.delete(budget);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }
}
