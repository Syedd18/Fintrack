package com.fintrack.repository;

import com.fintrack.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    
    List<Budget> findByUserId(UUID userId);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.category = :category AND b.startDate <= :date AND b.endDate >= :date")
    Optional<Budget> findActiveBudget(
            @Param("userId") UUID userId, 
            @Param("category") String category, 
            @Param("date") LocalDate date
    );
}
