package com.fashionstore.controller;

import com.fashionstore.dto.OrderRequest;
import com.fashionstore.model.Order;
import com.fashionstore.model.User;
import com.fashionstore.service.OrderService;
import com.fashionstore.service.PdfInvoiceService;
import jakarta.validation.Valid;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final PdfInvoiceService pdfInvoiceService;

    public OrderController(OrderService orderService, PdfInvoiceService pdfInvoiceService) {
        this.orderService = orderService;
        this.pdfInvoiceService = pdfInvoiceService;
    }

    @PostMapping
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderService.createOrder(user.getId(), request);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(orderService.getOrdersByUser(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderService.getOrderById(id, user.getId(), user.getRole().name());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<InputStreamResource> downloadInvoice(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderService.getOrderById(id, user.getId(), user.getRole().name());

        ByteArrayInputStream bis = pdfInvoiceService.generateInvoice(order);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=invoice-" + order.getId() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Order order = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(order);
    }
}
