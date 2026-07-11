package com.fashionstore.controller;

import com.fashionstore.model.Order;
import com.fashionstore.model.User;
import com.fashionstore.model.Role;
import com.fashionstore.repository.OrderRepository;
import com.fashionstore.repository.UserRepository;
import com.fashionstore.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.fashionstore.service.EmailService;

import java.util.List;

@RestController
@RequestMapping("/api/agency")
public class AgencyController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final EmailService emailService;

    public AgencyController(OrderRepository orderRepository, UserRepository userRepository, OrderService orderService, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.emailService = emailService;
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAgencyOrders() {
        User agency = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // Since we want all orders routed to this agency, let's add custom query in OrderRepository or filter here.
        // Actually, let's add a query in OrderRepository to keep it optimal!
        // We'll define findByAgencyIdOrderByOrderDateDesc in OrderRepository.
        return ResponseEntity.ok(orderRepository.findByAgencyIdOrderByOrderDateDesc(agency.getId()));
    }

    @GetMapping("/delivery-persons")
    public ResponseEntity<List<User>> getAgencyDeliveryPersons() {
        User agency = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userRepository.findByAgencyId(agency.getId()));
    }

    @PutMapping("/orders/{orderId}/assign")
    public ResponseEntity<Order> assignDeliveryAgent(
            @PathVariable Long orderId,
            @RequestParam Long deliveryPersonId
    ) {
        User agency = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getAgency() == null || !order.getAgency().getId().equals(agency.getId())) {
            throw new IllegalArgumentException("This order is not assigned to your agency");
        }

        User deliveryPerson = userRepository.findById(deliveryPersonId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery agent not found"));

        if (deliveryPerson.getAgency() == null || !deliveryPerson.getAgency().getId().equals(agency.getId())) {
            throw new IllegalArgumentException("This delivery agent does not belong to your agency");
        }

        // Set delivery person
        order.setDeliveryPerson(deliveryPerson);
        // Automatically transition status to SHIPPED (shipment added)
        order.setStatus("SHIPPED");

        Order savedOrder = orderRepository.save(order);

        // Send notifications
        try {
            // 1. Send to delivery person
            String agentSubject = "New Consignment Assigned - Order #" + savedOrder.getId();
            String agentBody = "Hello " + deliveryPerson.getFirstName() + ",\n\n" +
                               "You have been assigned a new delivery task!\n\n" +
                               "Order Details:\n" +
                               "- Order Number: #" + savedOrder.getId() + "\n" +
                               "- Customer Name: " + savedOrder.getUser().getFirstName() + " " + savedOrder.getUser().getLastName() + "\n" +
                               "- Shipping Address: " + (savedOrder.getShippingAddress() != null 
                                 ? savedOrder.getShippingAddress().getStreet() + ", " + savedOrder.getShippingAddress().getCity() 
                                 : "Not Provided") + "\n" +
                               "- Total Amount: $" + savedOrder.getTotalAmount().toString() + "\n\n" +
                               "Please log in to the Delivery Portal to update the delivery status once dispatched and delivered.\n\n" +
                               "Thank you,\nFashion Store Team";
            emailService.sendEmail(deliveryPerson.getEmail(), agentSubject, agentBody);

            // 2. Send to customer
            String customerSubject = "Your Order #" + savedOrder.getId() + " is Shipped!";
            String customerBody = "Hello " + savedOrder.getUser().getFirstName() + ",\n\n" +
                                 "Great news! Your order has been dispatched by our shipping agency and is on its way to you.\n\n" +
                                 "Delivery Details:\n" +
                                 "- Order Number: #" + savedOrder.getId() + "\n" +
                                 "- Assigned Delivery Agent: " + deliveryPerson.getFirstName() + " " + deliveryPerson.getLastName() + "\n" +
                                 "- Delivery Agent Contact: " + (deliveryPerson.getPhone() != null ? deliveryPerson.getPhone() : "Not Provided") + "\n" +
                                 "- Tracking Number: " + savedOrder.getTrackingNumber() + "\n\n" +
                                 "Thank you for shopping with us!\nFashion Store Team";
            emailService.sendEmail(savedOrder.getUser().getEmail(), customerSubject, customerBody);
        } catch (Exception e) {
            System.err.println("Failed to send agency assignment notification emails: " + e.getMessage());
        }

        return ResponseEntity.ok(savedOrder);
    }
}
