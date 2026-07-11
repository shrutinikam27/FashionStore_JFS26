package com.fashionstore.controller;

import com.fashionstore.dto.ReviewRequest;
import com.fashionstore.model.Product;
import com.fashionstore.model.Review;
import com.fashionstore.model.User;
import com.fashionstore.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search
    ) {
        List<Product> products = productService.filterProducts(categoryId, brandId, minPrice, maxPrice, search);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getRecommendations(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getReviewsByProduct(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Review review = productService.addReview(id, user.getId(), request);
        return ResponseEntity.ok(review);
    }
}
