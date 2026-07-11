package com.fashionstore.controller;

import com.fashionstore.dto.OrderStatusRequest;
import com.fashionstore.model.Order;
import com.fashionstore.model.User;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public DeliveryController(OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAssignedOrders() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(orderRepository.findByDeliveryPersonIdOrderByOrderDateDesc(user.getId()));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusRequest request
    ) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getDeliveryPerson() == null || !order.getDeliveryPerson().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are not authorized to update this order's status");
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request.status()));
    }
}
