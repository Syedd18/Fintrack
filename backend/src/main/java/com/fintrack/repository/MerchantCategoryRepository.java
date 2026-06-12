package com.fintrack.repository;

import com.fintrack.entity.MerchantCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantCategoryRepository extends JpaRepository<MerchantCategory, UUID> {
    Optional<MerchantCategory> findByMerchantNameIgnoreCase(String merchantName);
}
