package com.fashionstore.controller;

import com.fashionstore.dto.AuthRequest;
import com.fashionstore.dto.AuthResponse;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.dto.ResetPasswordRequest;
import com.fashionstore.service.AuthService;
import com.fashionstore.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    public AuthController(AuthService authService, EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String msg = authService.register(request);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        String msg = authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String msg = authService.initiatePasswordReset(email.trim());
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String msg = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> request) {
        AuthResponse response = authService.googleSsoAuthenticate(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/emails")
    public ResponseEntity<List<EmailService.MockEmail>> getMockEmails() {
        return ResponseEntity.ok(emailService.getMockEmails());
    }
}
