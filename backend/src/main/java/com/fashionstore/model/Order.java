package com.fashionstore.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "verificationToken", "resetToken", "authorities",
                            "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "delivery_person_id")
    @JsonIgnoreProperties({"password", "verificationToken", "resetToken", "authorities",
                            "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User deliveryPerson;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agency_id")
    @JsonIgnoreProperties({"password", "verificationToken", "resetToken", "authorities",
                            "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User agency;


    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now();

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // STRIPE, RAZORPAY, CASH_ON_DELIVERY

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getDeliveryPerson() { return deliveryPerson; }
    public void setDeliveryPerson(User deliveryPerson) { this.deliveryPerson = deliveryPerson; }

    public User getAgency() { return agency; }
    public void setAgency(User agency) { this.agency = agency; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public Address getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(Address shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}
