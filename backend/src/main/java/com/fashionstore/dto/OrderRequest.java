package com.fashionstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderRequest(
    @NotNull(message = "Shipping address ID is required")
    Long shippingAddressId,

    String couponCode,

    @NotBlank(message = "Payment method is required")
    String paymentMethod, // STRIPE, RAZORPAY, CASH_ON_DELIVERY

    String transactionId // For online payments mock
) {}
