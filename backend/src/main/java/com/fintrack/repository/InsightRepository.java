package com.fintrack.repository;

import com.fintrack.entity.Insight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InsightRepository extends JpaRepository<Insight, UUID> {
    Page<Insight> findByUserId(UUID userId, Pageable pageable);
}
