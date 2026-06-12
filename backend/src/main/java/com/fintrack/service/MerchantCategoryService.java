package com.fintrack.service;

import com.fintrack.entity.MerchantCategory;
import com.fintrack.repository.MerchantCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MerchantCategoryService {

    private final MerchantCategoryRepository merchantCategoryRepository;

    public String categorize(String merchant) {
        if (merchant == null || merchant.trim().isEmpty()) {
            return "Others";
        }

        String merchantClean = merchant.trim().toLowerCase();

        // 1. Direct DB match
        Optional<MerchantCategory> directMatch = merchantCategoryRepository.findByMerchantNameIgnoreCase(merchantClean);
        if (directMatch.isPresent()) {
            return directMatch.get().getCategory();
        }

        // 2. Fuzzy match checks on database records
        // For production scale, check if merchant clean contains any registered keywords
        return merchantCategoryRepository.findAll().stream()
                .filter(mc -> merchantClean.contains(mc.getMerchantName().toLowerCase()) || 
                              mc.getMerchantName().toLowerCase().contains(merchantClean))
                .map(MerchantCategory::getCategory)
                .findFirst()
                .orElseGet(() -> fallbackHeuristics(merchantClean));
    }

    private String fallbackHeuristics(String merchant) {
        if (merchant.contains("swiggy") || merchant.contains("zomato") || merchant.contains("food") || merchant.contains("restaurant") || merchant.contains("starbucks")) {
            return "Food";
        }
        if (merchant.contains("uber") || merchant.contains("ola") || merchant.contains("irctc") || merchant.contains("metro") || merchant.contains("cab") || merchant.contains("travel")) {
            return "Travel";
        }
        if (merchant.contains("amazon") || merchant.contains("flipkart") || merchant.contains("myntra") || merchant.contains("shopping") || merchant.contains("supermarket") || merchant.contains("mart")) {
            return "Shopping";
        }
        if (merchant.contains("netflix") || merchant.contains("spotify") || merchant.contains("hotstar") || merchant.contains("cinema") || merchant.contains("bookmyshow") || merchant.contains("entertainment")) {
            return "Entertainment";
        }
        if (merchant.contains("jio") || merchant.contains("airtel") || merchant.contains("electricity") || merchant.contains("water") || merchant.contains("bill") || merchant.contains("recharge") || merchant.contains("utility")) {
            return "Bills";
        }
        if (merchant.contains("hospital") || merchant.contains("pharmacy") || merchant.contains("medical") || merchant.contains("clinic") || merchant.contains("doctor")) {
            return "Healthcare";
        }
        if (merchant.contains("school") || merchant.contains("college") || merchant.contains("coursera") || merchant.contains("udemy") || merchant.contains("education")) {
            return "Education";
        }
        if (merchant.contains("petrol") || merchant.contains("fuel") || merchant.contains("cng") || merchant.contains("shell")) {
            return "Fuel";
        }
        if (merchant.contains("zerodha") || merchant.contains("groww") || merchant.contains("mutual fund") || merchant.contains("stock") || merchant.contains("investment")) {
            return "Investments";
        }
        
        return "Others";
    }
}
