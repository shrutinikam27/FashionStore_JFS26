import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const response = await api.get('/wishlist');
      setWishlistCount(response.data.length);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlistCount(0);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1, size = null) => {
    if (!user) {
      throw new Error('Please log in to add items to your cart.');
    }
    setLoading(true);
    try {
      const response = await api.post('/cart/items', { productId, quantity, size });
      setCart(response.data);
      // Dispatch custom trigger for visual toast notifications
      window.dispatchEvent(new CustomEvent('cart-alert', { detail: 'Product added to cart successfully!' }));
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add item to cart';
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQty = async (productId, quantity) => {
    if (!user) return;
    try {
      const response = await api.put('/cart/items', { productId, quantity });
      setCart(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update quantity';
      alert(msg);
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;
    try {
      const response = await api.delete(`/cart/items/${productId}`);
      setCart(response.data);
      window.dispatchEvent(new CustomEvent('cart-alert', { detail: 'Item removed from cart' }));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete('/cart');
      setCart({ cartItems: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const itemsCount = cart?.cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartSubtotal = cart?.cartItems?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  const value = {
    cart,
    wishlistCount,
    loading,
    itemsCount,
    cartSubtotal,
    fetchCart,
    fetchWishlist,
    addToCart,
    updateItemQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};
