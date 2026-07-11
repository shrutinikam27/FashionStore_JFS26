package com.fashionstore.controller;

import com.fashionstore.model.User;
import com.fashionstore.model.Wishlist;
import com.fashionstore.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<Wishlist>> getMyWishlist() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(user.getId()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long productId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Wishlist wishlist = wishlistService.addToWishlist(user.getId(), productId);
        return ResponseEntity.ok(wishlist);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeFromWishlist(@PathVariable Long productId) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(Map.of("message", "Product removed from wishlist"));
    }
}
