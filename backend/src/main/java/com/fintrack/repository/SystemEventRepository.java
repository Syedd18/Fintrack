package com.fintrack.repository;

import com.fintrack.entity.SystemEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SystemEventRepository extends JpaRepository<SystemEvent, UUID> {
    Page<SystemEvent> findByEventType(String eventType, Pageable pageable);
}
