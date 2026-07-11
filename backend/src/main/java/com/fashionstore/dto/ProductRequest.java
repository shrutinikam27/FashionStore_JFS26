package com.fashionstore.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank(message = "Product name is required")
    String name,

    String description,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    BigDecimal price,

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    Integer stockQuantity,

    @NotNull(message = "Category ID is required")
    Long categoryId,

    @NotNull(message = "Brand ID is required")
    Long brandId,

    @NotBlank(message = "SKU is required")
    String sku,

    String imageUrl,
    
    boolean active,

    java.util.List<String> sizes
) {}
