package com.fashionstore.controller;

import com.fashionstore.dto.CartItemRequest;
import com.fashionstore.model.Cart;
import com.fashionstore.model.User;
import com.fashionstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(cartService.getCartByUserId(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Cart cart = cartService.addItemToCart(user.getId(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items")
    public ResponseEntity<Cart> updateItemQuantity(@Valid @RequestBody CartItemRequest request) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Cart cart = cartService.updateItemQuantity(user.getId(), request);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItemFromCart(@PathVariable Long productId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Cart cart = cartService.removeItemFromCart(user.getId(), productId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
