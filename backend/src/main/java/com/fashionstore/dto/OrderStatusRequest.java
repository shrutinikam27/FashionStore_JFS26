package com.fashionstore.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderStatusRequest(
    @NotBlank(message = "Status cannot be blank")
    String status
) {}
