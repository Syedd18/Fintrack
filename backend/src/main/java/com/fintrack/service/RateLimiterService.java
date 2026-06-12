package com.fintrack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Slf4j
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String clientKey, int limit, int windowSeconds) {
        try {
            String redisKey = "ratelimit:" + clientKey;
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);
            
            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }
            
            if (currentRequests != null && currentRequests > limit) {
                log.warn("Rate limit exceeded for clientKey: {}. Current requests: {}", clientKey, currentRequests);
                return false;
            }
            
            return true;
        } catch (Exception ex) {
            log.error("Redis connection error in rate limiter, allowing request: {}", ex.getMessage());
            return true; // Resilience fallback
        }
    }
}
