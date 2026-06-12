package com.fintrack.controller;

import com.fintrack.entity.MerchantCategory;
import com.fintrack.repository.MerchantCategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/merchant-categories")
@RequiredArgsConstructor
@Tag(name = "Merchant Categories", description = "Endpoints for managing merchant-to-category mapping rules")
public class MerchantCategoryController {

    private final MerchantCategoryRepository merchantCategoryRepository;

    @GetMapping
    @Operation(summary = "Get all merchant category mapping rules")
    public ResponseEntity<List<MerchantCategory>> getAllRules() {
        return ResponseEntity.ok(merchantCategoryRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    @Operation(summary = "Create or update a mapping rule")
    public ResponseEntity<MerchantCategory> createOrUpdateRule(@Valid @RequestBody MerchantCategory rule) {
        // Find existing to avoid database unique constraint failure
        return merchantCategoryRepository.findByMerchantNameIgnoreCase(rule.getMerchantName())
                .map(existing -> {
                    existing.setCategory(rule.getCategory());
                    existing.setPatternType(rule.getPatternType());
                    return ResponseEntity.ok(merchantCategoryRepository.save(existing));
                })
                .orElseGet(() -> ResponseEntity.ok(merchantCategoryRepository.save(rule)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a mapping rule")
    public ResponseEntity<Void> deleteRule(@PathVariable UUID id) {
        if (merchantCategoryRepository.existsById(id)) {
            merchantCategoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
