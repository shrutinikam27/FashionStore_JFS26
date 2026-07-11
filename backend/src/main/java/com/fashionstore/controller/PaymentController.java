package com.fashionstore.controller;

import com.fashionstore.dto.PaymentIntentRequest;
import com.fashionstore.dto.PaymentIntentResponse;
import com.fashionstore.model.User;
import com.fashionstore.service.OrderService;
import com.fashionstore.service.StripeService;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final StripeService stripeService;
    private final OrderService orderService;

    @Value("${stripe.publishable.key}")
    private String publishableKey;

    public PaymentController(StripeService stripeService, OrderService orderService) {
        this.stripeService = stripeService;
        this.orderService = orderService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("publishableKey", publishableKey));
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            BigDecimal amount = orderService.calculateTotalAmount(user.getId(), request.couponCode());
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(amount, "usd");
            PaymentIntentResponse response = new PaymentIntentResponse(
                    paymentIntent.getClientSecret(),
                    paymentIntent.getId(),
                    amount,
                    "usd"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Stripe payment initiation failed: " + e.getMessage()));
        }
    }
}
