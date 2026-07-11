package com.fashionstore.service;

import com.fashionstore.dto.CartItemRequest;
import com.fashionstore.model.Cart;
import com.fashionstore.model.CartItem;
import com.fashionstore.model.Product;
import com.fashionstore.model.User;
import com.fashionstore.repository.CartItemRepository;
import com.fashionstore.repository.CartRepository;
import com.fashionstore.repository.ProductRepository;
import com.fashionstore.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, 
                       ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    @Transactional
    public Cart addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < request.quantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        // Check if item with same product ID AND size already exists in cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getId().equals(request.productId()) 
                        && ((item.getSize() == null && request.size() == null) 
                            || (item.getSize() != null && item.getSize().equals(request.size()))))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.quantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Updated quantity exceeds available stock (" + product.getStockQuantity() + ")");
            }
            item.setQuantity(newQuantity);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(request.quantity());
            item.setSize(request.size());
            cart.getCartItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItemQuantity(Long userId, CartItemRequest request) {
        Cart cart = getCartByUserId(userId);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < request.quantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock (" + product.getStockQuantity() + ")");
        }

        CartItem item = cart.getCartItems().stream()
                .filter(ci -> ci.getProduct().getId().equals(request.productId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Product not in cart"));

        item.setQuantity(request.quantity());
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItemFromCart(Long userId, Long productId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().removeIf(item -> item.getProduct().getId().equals(productId));
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getCartItems().clear();
        cartRepository.save(cart);
    }
}
