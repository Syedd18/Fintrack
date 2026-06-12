package com.fintrack.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Tag(name = "Health", description = "System diagnostic and status checks")
public class HealthCheckController {

    private final JdbcTemplate jdbcTemplate;
    private final StringRedisTemplate redisTemplate;

    @GetMapping
    @Operation(summary = "Get detailed backend database & cache connection health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");

        // Database status
        try {
            jdbcTemplate.execute("SELECT 1");
            health.put("database", "UP");
        } catch (Exception ex) {
            health.put("database", "DOWN: " + ex.getMessage());
            health.put("status", "DOWN");
        }

        // Redis status
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            health.put("redis", "UP");
        } catch (Exception ex) {
            health.put("redis", "DOWN: " + ex.getMessage());
            health.put("status", "DOWN");
        }

        // Memory stats
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memory = new HashMap<>();
        memory.put("totalMemoryMB", runtime.totalMemory() / (1024 * 1024));
        memory.put("freeMemoryMB", runtime.freeMemory() / (1024 * 1024));
        memory.put("maxMemoryMB", runtime.maxMemory() / (1024 * 1024));
        health.put("memory", memory);

        return ResponseEntity.ok(health);
    }
}
