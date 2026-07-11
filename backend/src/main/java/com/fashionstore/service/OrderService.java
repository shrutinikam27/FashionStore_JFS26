package com.fashionstore.service;

import com.fashionstore.dto.OrderRequest;
import com.fashionstore.model.*;
import com.fashionstore.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final PdfInvoiceService pdfInvoiceService;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartService cartService, 
                        AddressRepository addressRepository, CouponRepository couponRepository,
                        ProductRepository productRepository, PaymentRepository paymentRepository,
                        EmailService emailService, PdfInvoiceService pdfInvoiceService,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.addressRepository = addressRepository;
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.emailService = emailService;
        this.pdfInvoiceService = pdfInvoiceService;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(Long userId, OrderRequest request) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout an empty shopping cart");
        }

        Address address = addressRepository.findById(request.shippingAddressId())
                .orElseThrow(() -> new IllegalArgumentException("Shipping address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Invalid shipping address");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Validate items and calculate subtotal
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Product " + product.getName() + " is out of stock (available: " + product.getStockQuantity() + ")");
            }
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        // Apply coupon if present
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCouponCode = null;
        if (request.couponCode() != null && !request.couponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(request.couponCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));

            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("This coupon code has expired");
            }

            if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new IllegalArgumentException("Minimum order amount of $" + coupon.getMinOrderAmount() + " not met for this coupon");
            }

            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = subtotal.multiply(coupon.getDiscountValue().divide(new BigDecimal("100.00")));
            } else if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = coupon.getDiscountValue();
            }
            
            // Cap discount at subtotal
            if (discount.compareTo(subtotal) > 0) {
                discount = subtotal;
            }
            appliedCouponCode = coupon.getCode();
        }

        BigDecimal totalAmount = subtotal.subtract(discount);

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setShippingAddress(address);
        order.setDiscountAmount(discount);
        order.setTotalAmount(totalAmount);
        order.setCouponCode(appliedCouponCode);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setPaymentMethod(request.paymentMethod());
        order.setTrackingNumber("FS-" + System.currentTimeMillis() / 1000);

        // Assign order to an agency
        List<User> agencies = userRepository.findByRole(Role.AGENCY);
        if (!agencies.isEmpty()) {
            order.setAgency(agencies.get(0));
        }

        // Map cart items to order items and deduct stock
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            
            // Deduct inventory
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice()); // Freeze price at purchase time
            orderItem.setSize(cartItem.getSize());
            order.getOrderItems().add(orderItem);
        }

        // Save the order first to ensure it has a generated ID (fixes TransientPropertyValueException)
        Order savedOrder = orderRepository.save(order);

        // Process Payment
        String payMethod = request.paymentMethod().toUpperCase();
        if ("CASH_ON_DELIVERY".equalsIgnoreCase(payMethod)) {
            savedOrder.setPaymentStatus("PENDING");
            savedOrder = orderRepository.save(savedOrder);
        } else {
            savedOrder.setPaymentStatus("PAID");
            savedOrder = orderRepository.save(savedOrder);
            
            String txId = request.transactionId();
            if (txId == null || txId.trim().isEmpty()) {
                txId = "MOCK-TX-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
            }

            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            payment.setTransactionId(txId);
            payment.setPaymentMethod(payMethod);
            payment.setAmount(totalAmount);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());
            
            // Save payment receipt alongside order cascading
            paymentRepository.save(payment);
        }

        // Clear cart after checkout
        cartService.clearCart(userId);

        // Dispatch order placement confirmation email
        try {
            String customerEmail = savedOrder.getUser().getEmail();
            String subject = "Order Confirmation - #" + savedOrder.getId();
            String body = "Hello " + savedOrder.getUser().getFirstName() + ",\n\n" +
                          "Your order has been placed successfully! We have attached your PDF invoice receipt to this email.\n\n" +
                          "Order Details:\n" +
                          "- Order Number: #" + savedOrder.getId() + "\n" +
                          "- Payment Method: " + savedOrder.getPaymentMethod() + "\n" +
                          "- Payment Status: " + savedOrder.getPaymentStatus() + "\n" +
                          "- Total Amount: $" + savedOrder.getTotalAmount().toString() + "\n\n" +
                          "We will notify you once your package is shipped.\n\n" +
                          "Thank you for shopping with us,\nFashion Store Team";
            
            // Generate PDF bytes
            java.io.ByteArrayInputStream bis = pdfInvoiceService.generateInvoice(savedOrder);
            byte[] pdfBytes = bis.readAllBytes();
            
            emailService.sendEmailWithAttachment(customerEmail, subject, body, pdfBytes, "invoice-" + savedOrder.getId() + ".pdf");
        } catch (Exception e) {
            // Log and catch silently so email failures don't roll back successful purchases
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public Order getOrderById(Long orderId, Long userId, String userRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (!"ADMIN".equalsIgnoreCase(userRole) && !order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view this order details");
        }

        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String cleanStatus = status.toUpperCase();
        if (!List.of("PENDING", "SHIPPED", "DELIVERED", "CANCELLED").contains(cleanStatus)) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }

        order.setStatus(cleanStatus);
        
        // If transitioning to DELIVERED, make sure payment is PAID
        if ("DELIVERED".equals(cleanStatus)) {
            order.setPaymentStatus("PAID");
        }
        
        // If cancelled, return stock to product inventory
        if ("CANCELLED".equals(cleanStatus) && !order.getStatus().equals("CANCELLED")) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to cancel this order");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Only pending orders can be cancelled");
        }

        order.setStatus("CANCELLED");
        order.setPaymentStatus("FAILED");

        // Return stock back to product inventory
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }

        return orderRepository.save(order);
    }

    public BigDecimal calculateTotalAmount(Long userId, String couponCode) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout an empty shopping cart");
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        // Validate items and calculate subtotal
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Product " + product.getName() + " is out of stock (available: " + product.getStockQuantity() + ")");
            }
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        // Apply coupon if present
        BigDecimal discount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(couponCode.trim())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code"));

            if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("This coupon code has expired");
            }

            if (subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new IllegalArgumentException("Minimum order amount of $" + coupon.getMinOrderAmount() + " not met for this coupon");
            }

            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = subtotal.multiply(coupon.getDiscountValue().divide(new BigDecimal("100.00")));
            } else if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = coupon.getDiscountValue();
            }
            
            // Cap discount at subtotal
            if (discount.compareTo(subtotal) > 0) {
                discount = subtotal;
            }
        }

        return subtotal.subtract(discount);
    }
}
