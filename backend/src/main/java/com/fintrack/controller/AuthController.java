package com.fintrack.controller;

import com.fintrack.config.JwtService;
import com.fintrack.dto.*;
import com.fintrack.entity.RefreshToken;
import com.fintrack.entity.User;
import com.fintrack.entity.UserSettings;
import com.fintrack.repository.RefreshTokenRepository;
import com.fintrack.repository.UserRepository;
import com.fintrack.repository.UserSettingsRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Endpoints for onboarding, login, and token refresh")
public class AuthController {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    @Value("${fintrack.security.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.USER)
                .build();
        
        User savedUser = userRepository.save(user);

        UserSettings settings = UserSettings.builder()
                .userId(savedUser.getId())
                .user(savedUser)
                .alertsEnabled(true)
                .dailySummaryEnabled(true)
                .currency("INR")
                .build();
        userSettingsRepository.save(settings);

        log.info("Registered user: {}", savedUser.getEmail());
        return ResponseEntity.ok("User registered successfully.");
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue tokens")
    @Transactional
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authorization."));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);

        // Generate Refresh Token
        String tokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenStr)
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();
        
        // Remove existing refresh tokens before storing the new one (single session model or append)
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.save(refreshToken);

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(tokenStr)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Issue a new access token using a refresh token")
    @Transactional
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequest request) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(request.getRefreshToken());

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid refresh token.");
        }

        RefreshToken token = tokenOpt.get();
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            return ResponseEntity.status(401).body("Refresh token expired. Please login again.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(token.getUser().getEmail());
        String newAccessToken = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(token.getToken())
                .userId(token.getUser().getId())
                .email(token.getUser().getEmail())
                .role(token.getUser().getRole().name())
                .build());
    }
}
