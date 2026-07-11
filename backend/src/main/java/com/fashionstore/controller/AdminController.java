package com.fashionstore.controller;

import com.fashionstore.dto.OrderStatusRequest;
import com.fashionstore.dto.ProductRequest;
import com.fashionstore.dto.SalesSummary;
import com.fashionstore.model.*;
import com.fashionstore.repository.*;
import com.fashionstore.service.AdminService;
import com.fashionstore.service.OrderService;
import com.fashionstore.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final ProductService productService;
    
    // Repositories injected directly for simple CRUD config to keep structure clean
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;

    public AdminController(AdminService adminService, OrderService orderService, ProductService productService,
                           UserRepository userRepository, CategoryRepository categoryRepository,
                           BrandRepository brandRepository, CouponRepository couponRepository,
                           OrderRepository orderRepository) {
        this.adminService = adminService;
        this.orderService = orderService;
        this.productService = productService;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
    }

    // Analytics Dashboard
    @GetMapping("/analytics")
    public ResponseEntity<SalesSummary> getAnalytics() {
        return ResponseEntity.ok(adminService.getSalesAnalytics());
    }

    // Order management
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.status()));
    }

    @PutMapping("/orders/{id}/delivery-person")
    public ResponseEntity<Order> assignDeliveryPerson(
            @PathVariable Long id,
            @RequestParam(required = false) Long deliveryPersonId
    ) {
        Order order = orderService.getOrderById(id, null, "ADMIN");
        User deliveryPerson = null;
        if (deliveryPersonId != null) {
            deliveryPerson = userRepository.findById(deliveryPersonId)
                    .orElseThrow(() -> new IllegalArgumentException("Delivery person not found"));
            if (deliveryPerson.getRole() != Role.DELIVERY_PERSON) {
                throw new IllegalArgumentException("Selected user is not a delivery person");
            }
        }
        order.setDeliveryPerson(deliveryPerson);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @GetMapping("/delivery-persons")
    public ResponseEntity<List<User>> getDeliveryPersons() {
        return ResponseEntity.ok(userRepository.findByRole(Role.DELIVERY_PERSON));
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("admin@fashionstore.com".equals(user.getEmail())) {
            throw new IllegalArgumentException("Cannot change the main seed administrator's role");
        }
        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<User> toggleUserEnabled(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Don't disable the active running admin
        if ("admin@fashionstore.com".equals(user.getEmail())) {
            throw new IllegalArgumentException("Cannot disable the main seed administrator account");
        }
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    // Product CRUD
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deactivated successfully"));
    }

    // Category CRUD
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        if (categoryRepository.findBySlug(category.getSlug()).isPresent()) {
            throw new IllegalArgumentException("Category slug already exists");
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @Valid @RequestBody Category updated) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setName(updated.getName());
        category.setDescription(updated.getDescription());
        category.setSlug(updated.getSlug());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }

    // Brand CRUD
    @GetMapping("/brands")
    public ResponseEntity<List<Brand>> getBrands() {
        return ResponseEntity.ok(brandRepository.findAll());
    }

    @PostMapping("/brands")
    public ResponseEntity<Brand> createBrand(@Valid @RequestBody Brand brand) {
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<Brand> updateBrand(@PathVariable Long id, @Valid @RequestBody Brand updated) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Brand not found"));
        brand.setName(updated.getName());
        brand.setLogoUrl(updated.getLogoUrl());
        return ResponseEntity.ok(brandRepository.save(brand));
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<Map<String, String>> deleteBrand(@PathVariable Long id) {
        brandRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Brand deleted successfully"));
    }

    // Coupon CRUD
    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@Valid @RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @Valid @RequestBody Coupon updated) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        coupon.setCode(updated.getCode());
        coupon.setDiscountType(updated.getDiscountType());
        coupon.setDiscountValue(updated.getDiscountValue());
        coupon.setMinOrderAmount(updated.getMinOrderAmount());
        coupon.setExpiryDate(updated.getExpiryDate());
        coupon.setActive(updated.isActive());
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Map<String, String>> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }
}
