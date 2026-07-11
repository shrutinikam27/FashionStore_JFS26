import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../context/AuthContext';

const Cart = () => {
  const { cart, cartSubtotal, updateItemQty, removeItem, itemsCount } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError(null);
    setAppliedCoupon(null);
    
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const response = await api.get(`/coupons/${couponCode.trim()}`);
      const coupon = response.data;

      if (cartSubtotal < coupon.minOrderAmount) {
        setCouponError(`Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} not met for this coupon`);
      } else {
        setAppliedCoupon(coupon);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or inactive coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Calculate discount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      return (cartSubtotal * (appliedCoupon.discountValue / 100));
    } else if (appliedCoupon.discountType === 'FLAT') {
      return appliedCoupon.discountValue;
    }
    return 0;
  };

  const discount = getDiscountAmount();
  const total = Math.max(0, cartSubtotal - discount);

  const handleCheckoutRedirect = () => {
    let url = '/checkout';
    if (appliedCoupon) {
      url += `?coupon=${appliedCoupon.code}`;
    }
    navigate(url);
  };

  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-panel p-5 max-w-md mx-auto" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <i className="bi bi-bag-x text-secondary display-3 mb-3"></i>
          <h4 className="fw-bold">Your Shopping Bag is Empty</h4>
          <p className="text-secondary small mb-4">
            Looks like you haven't added anything to your cart yet. Explore our catalog to find your favorite fits.
          </p>
          <Link to="/shop" className="btn btn-premium rounded-pill px-4">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="fw-bold mb-4">Shopping Bag</h3>
      
      <div className="row g-4">
        {/* Cart items list */}
        <div className="col-lg-8">
          <div className="glass-panel p-4 d-flex flex-column gap-4">
            {cart.cartItems.map((item) => (
              <div key={item.id} className="d-flex flex-sm-row flex-column gap-3 pb-4 border-bottom border-secondary border-opacity-10 align-items-sm-center">
                {/* Product image */}
                <div className="bg-light rounded overflow-hidden" style={{ width: '90px', height: '110px', flexShrink: 0 }}>
                  <img
                    src={item.product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'}
                    alt={item.product.name}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                
                {/* Product details */}
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">
                    <Link to={`/products/${item.product.id}`} className="text-decoration-none text-primary">
                      {item.product.name}
                    </Link>
                  </h6>
                  <span className="text-muted small d-block mb-1">{item.product.brand?.name}</span>
                  {item.size && (
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(99, 102, 241, 0.08)',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Size: {item.size}
                    </span>
                  )}
                  <span className="fw-semibold text-gradient d-block">${item.product.price.toFixed(2)}</span>
                </div>
                
                {/* Quantity selector */}
                <div className="d-flex align-items-center border border-secondary border-opacity-25 rounded-pill px-2.5 py-1 bg-light" style={{ width: '105px' }}>
                  <button
                    onClick={() => updateItemQty(item.product.id, Math.max(1, item.quantity - 1))}
                    className="btn btn-link nav-link p-1 text-secondary"
                    disabled={item.quantity <= 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="mx-auto fw-bold text-primary small">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQty(item.product.id, Math.min(item.product.stockQuantity, item.quantity + 1))}
                    className="btn btn-link nav-link p-1 text-secondary"
                    disabled={item.quantity >= item.product.stockQuantity}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                
                {/* Remove button */}
                <div className="text-sm-end text-start">
                  <span className="fw-bold d-block mb-1">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="btn btn-link text-danger p-0 nav-link text-decoration-none small"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <i className="bi bi-trash me-1"></i> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary Summary */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 sticky-lg-top" style={{ top: '100px', zIndex: 1 }}>
            <h5 className="fw-bold mb-4">Order Summary</h5>
            
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between text-secondary small">
                <span>Subtotal ({itemsCount} items)</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small">
                <span>Shipping</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>
              {appliedCoupon && (
                <div className="d-flex justify-content-between text-success small fw-semibold">
                  <span className="d-flex align-items-center">
                    <i className="bi bi-tag-fill me-1"></i> Coupon: {appliedCoupon.code}
                    <button onClick={handleRemoveCoupon} className="btn btn-link text-danger p-0 ms-1 nav-link" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-x-circle"></i>
                    </button>
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-secondary opacity-25 my-1" />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span className="text-gradient">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo code input form */}
            {!appliedCoupon && (
              <form onSubmit={handleApplyCoupon} className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Apply Promo Coupon</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn btn-premium px-3" type="submit" disabled={couponLoading}>
                    {couponLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <div className="text-danger small mt-1">
                    <i className="bi bi-exclamation-circle-fill me-1"></i> {couponError}
                  </div>
                )}
              </form>
            )}

            <button
              onClick={handleCheckoutRedirect}
              className="btn btn-premium w-100 rounded-pill py-3 fw-bold fs-6 shadow-sm mt-2"
            >
              Proceed to Checkout
            </button>
            <div className="text-center mt-3">
              <Link to="/shop" className="text-decoration-none text-muted small hover-text-primary">
                <i className="bi bi-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
