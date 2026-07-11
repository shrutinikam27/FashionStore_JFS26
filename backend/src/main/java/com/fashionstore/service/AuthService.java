package com.fashionstore.service;

import com.fashionstore.config.JwtService;
import com.fashionstore.dto.AuthRequest;
import com.fashionstore.dto.AuthResponse;
import com.fashionstore.dto.RegisterRequest;
import com.fashionstore.dto.ResetPasswordRequest;
import com.fashionstore.model.Cart;
import com.fashionstore.model.Role;
import com.fashionstore.model.User;
import com.fashionstore.repository.CartRepository;
import com.fashionstore.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, CartRepository cartRepository, 
                       PasswordEncoder passwordEncoder, JwtService jwtService, 
                       AuthenticationManager authenticationManager, EmailService emailService) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email address already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPhone(request.phone());
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true); // Enabled by default to remove verification lockout

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);

        User savedUser = userRepository.save(user);

        // Pre-create cart for new user
        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        // Dispatch welcome email
        emailService.sendEmail(
                request.email(),
                "Welcome to Fashion Store!",
                "Hello " + request.firstName() + ",\n\n" +
                "Thank you for registering at Fashion Store! Your account is active and you can start shopping now.\n\n" +
                "Best regards,\nFashion Store Team"
        );

        return "Registration successful! You can now log in immediately.";
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Please verify your email address before logging in");
        }

        String token = jwtService.generateToken(Map.of("role", user.getRole().name()), user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getId()
        );
    }

    @Transactional
    public AuthResponse googleSsoAuthenticate(Map<String, String> ssoData) {
        String email = ssoData.get("email");
        String firstName = ssoData.get("firstName");
        String lastName = ssoData.get("lastName");

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid Google profile data");
        }

        // Find or create customer account automatically
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            // Secure random password for OAuth users
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setFirstName(firstName != null ? firstName : "Google");
            newUser.setLastName(lastName != null ? lastName : "User");
            newUser.setRole(Role.CUSTOMER);
            newUser.setEnabled(true);
            User saved = userRepository.save(newUser);

            // Pre-create cart for new SSO user
            Cart cart = new Cart();
            cart.setUser(saved);
            cartRepository.save(cart);

            return saved;
        });

        String token = jwtService.generateToken(Map.of("role", user.getRole().name()), user);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getId()
        );
    }

    @Transactional
    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return "Email verified successfully! You can now log in.";
    }

    @Transactional
    public String initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account associated with this email"));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userRepository.save(user);

        // Dispatch password reset email
        emailService.sendEmail(
                email,
                "Reset Your Password - Fashion Store",
                "Hello,\n\n" +
                "We received a request to reset your password. Please use the link below to set a new password:\n\n" +
                "http://localhost:5173/reset-password?token=" + resetToken + "\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\nFashion Store Team"
        );

        return "Password reset link sent to your email.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        return "Password reset successful! You can now log in with your new password.";
    }
}
