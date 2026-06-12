package com.fintrack.repository;

import com.fintrack.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    Page<Transaction> findByUserId(UUID userId, Pageable pageable);
    
    Optional<Transaction> findByTransactionId(String transactionId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId ORDER BY t.timestamp DESC, t.createdAt DESC LIMIT 1")
    Optional<Transaction> findLatestTransactionByUserId(@Param("userId") UUID userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.timestamp >= :start AND t.timestamp <= :end ORDER BY t.timestamp DESC")
    List<Transaction> findTransactionsInTimeframe(
            @Param("userId") UUID userId, 
            @Param("start") OffsetDateTime start, 
            @Param("end") OffsetDateTime end
    );

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.timestamp >= :start AND t.timestamp <= :end AND t.status = 'COMPLETED' GROUP BY t.category")
    List<Object[]> getCategorySpendingReport(
            @Param("userId") UUID userId, 
            @Param("start") OffsetDateTime start, 
            @Param("end") OffsetDateTime end
    );
}
