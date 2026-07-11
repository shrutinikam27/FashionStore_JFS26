package com.fashionstore.service;

import com.fashionstore.dto.ProductRequest;
import com.fashionstore.dto.ReviewRequest;
import com.fashionstore.model.*;
import com.fashionstore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, 
                          BrandRepository brandRepository, ReviewRepository reviewRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Product> filterProducts(Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String search) {
        String querySearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        return productRepository.filterProducts(categoryId, brandId, minPrice, maxPrice, querySearch);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));
    }

    public List<Product> getRecommendations(Long productId) {
        Product product = getProductById(productId);
        if (product.getCategory() == null) {
            return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc();
        }
        // Fetch up to 4 active products in the same category, excluding current product
        return productRepository.findByCategoryIdAndActiveTrueAndIdNot(product.getCategory().getId(), productId)
                .stream().limit(4).toList();
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        Product product = new Product();
        updateProductFields(product, request, category, brand);
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));

        updateProductFields(product, request, category, brand);
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false); // Soft delete
        productRepository.save(product);
    }

    private void updateProductFields(Product product, ProductRequest request, Category category, Brand brand) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setCategory(category);
        product.setBrand(brand);
        product.setSku(request.sku());
        if (request.imageUrl() != null) {
            product.setImageUrl(request.imageUrl());
        }
        product.setActive(request.active());
        if (request.sizes() != null) {
            product.setSizes(request.sizes());
        }
    }

    // Reviews logic
    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public Review addReview(Long productId, Long userId, ReviewRequest request) {
        Product product = getProductById(productId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.rating());
        review.setComment(request.comment());

        return reviewRepository.save(review);
    }
}
