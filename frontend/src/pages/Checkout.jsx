import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrderTimeline from '../components/OrderTimeline';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

let stripePromise = null;
const getStripe = (key) => {
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

const Checkout = ({ isMockMode }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cart, cartSubtotal, fetchCart, itemsCount } = useCart();
  
  // Mock Payment States (for demo fallback)
  const [mockCardNumber, setMockCardNumber] = useState('');
  const [mockCardExpiry, setMockCardExpiry] = useState('');
  const [mockCardCvv, setMockCardCvv] = useState('');

  const couponCode = searchParams.get('coupon') || '';
  const [coupon, setCoupon] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // New Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');

  // Submit Order states
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const addrRes = await api.get('/addresses');
        setAddresses(addrRes.data);
        const defaultAddr = addrRes.data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (addrRes.data.length > 0) {
          setSelectedAddressId(addrRes.data[0].id);
        }

        if (couponCode) {
          const coupRes = await api.get(`/coupons/${couponCode}`);
          setCoupon(coupRes.data);
        }
      } catch (err) {
        console.error('Error fetching checkout data:', err);
      }
    };
    fetchCheckoutData();
  }, [couponCode]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/addresses', {
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: true,
      });
      setAddresses([...addresses, response.data]);
      setSelectedAddressId(response.data.id);
      setShowAddressForm(false);
      // Reset form
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
    } catch (err) {
      alert('Failed to save address details');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/addresses/${addrId}`);
      setAddresses(addresses.filter(a => a.id !== addrId));
      if (String(selectedAddressId) === String(addrId)) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg('Please select or add a shipping address.');
      return;
    }

    if (paymentMethod === 'STRIPE' && isMockMode && (!mockCardNumber || !mockCardExpiry || !mockCardCvv)) {
      setErrorMsg('Please enter card details for demo processing.');
      return;
    }

    setErrorMsg(null);
    setCheckingOut(true);

    try {
      let transactionId = null;
      if (paymentMethod === 'STRIPE') {
        if (isMockMode) {
          // Simulate Stripe network capture delay
          await new Promise((resolve) => setTimeout(resolve, 1500));
          transactionId = 'TX-STRIPE-DEMO-' + Math.random().toString(36).substring(2, 11).toUpperCase();
        } else {
          if (!stripe || !elements) {
            setErrorMsg('Stripe has not loaded yet. Please try again in a moment.');
            setCheckingOut(false);
            return;
          }

          // 1. Create PaymentIntent on the backend
          const intentRes = await api.post('/payment/create-payment-intent', {
            couponCode: coupon ? coupon.code : null,
          });
          const { clientSecret, paymentIntentId } = intentRes.data;

          // 2. Confirm the payment on the frontend using Stripe Elements CardElement
          const cardElement = elements.getElement(CardElement);
          const stripeResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });

          if (stripeResult.error) {
            setErrorMsg(stripeResult.error.message);
            setCheckingOut(false);
            return;
          }

          if (stripeResult.paymentIntent.status === 'succeeded') {
            transactionId = paymentIntentId;
          } else {
            setErrorMsg('Stripe payment was not successful. Status: ' + stripeResult.paymentIntent.status);
            setCheckingOut(false);
            return;
          }
        }
      }

      // 3. Finalize order on backend
      const response = await api.post('/orders', {
        shippingAddressId: selectedAddressId,
        couponCode: coupon ? coupon.code : null,
        paymentMethod,
        transactionId,
      });

      setOrderSuccess(response.data);
      fetchCart(); // Clear cart state in context
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Calculate prices
  const getDiscountAmount = () => {
    if (!coupon) return 0;
    if (coupon.discountType === 'PERCENTAGE') {
      return (cartSubtotal * (coupon.discountValue / 100));
    } else if (coupon.discountType === 'FLAT') {
      return coupon.discountValue;
    }
    return 0;
  };

  const discount = getDiscountAmount();
  const total = Math.max(0, cartSubtotal - discount);

  if (orderSuccess) {
    return (
      <div className="container py-5">
        <div className="glass-panel p-5 text-center max-w-xl mx-auto" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <i className="bi bi-patch-check-fill text-success display-3 mb-3"></i>
          <h3 className="fw-bold text-gradient">Order Placed Successfully!</h3>
          <p className="text-secondary small mb-4">
            Thank you for shopping with us! Your order ID is <strong>#{orderSuccess.id}</strong>. We've sent a confirmation receipt to your registered email.
          </p>
          
          <div className="text-start mb-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-clock-history me-1"></i> Delivery Timeline</h6>
            <OrderTimeline order={orderSuccess} />
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/profile#orders" className="btn btn-premium rounded-pill px-4">
              View Order Logs
            </Link>
            <Link to="/shop" className="btn btn-premium-outline rounded-pill px-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="fw-bold mb-4">Secure Checkout</h3>
      
      {errorMsg && (
        <div className="alert alert-danger py-2.5 mb-4 border-0 rounded-lg">
          <i className="bi bi-exclamation-octagon-fill me-2"></i> {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Left Side Details */}
        <div className="col-lg-8">
          {/* Shipping Addresses Section */}
          <div className="glass-panel p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>1. Shipping Address</span>
              {!showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className="btn btn-link text-decoration-none p-0 small">
                  + Add New
                </button>
              )}
            </h5>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Street Address</label>
                  <input type="text" className="form-control" placeholder="123 Fashion St." value={street} onChange={(e) => setStreet(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input type="text" className="form-control" placeholder="New York" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">State / Province</label>
                  <input type="text" className="form-control" placeholder="NY" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Zip / Postal Code</label>
                  <input type="text" className="form-control" placeholder="10001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Country</label>
                  <select className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-link text-decoration-none text-muted">Cancel</button>
                  <button type="submit" className="btn btn-premium px-4 rounded-pill">Save Address</button>
                </div>
              </form>
            ) : (
              addresses.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="d-flex gap-3 p-3 rounded border border-secondary border-opacity-10 align-items-center bg-light justify-content-between">
                      <label className="d-flex gap-3 cursor-pointer align-items-center flex-grow-1 mb-0">
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={addr.id}
                          checked={String(selectedAddressId) === String(addr.id)}
                          onChange={() => setSelectedAddressId(addr.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <div className="small">
                          <span className="fw-bold d-block">
                            {addr.street} {addr.isDefault && <span className="badge bg-secondary badge-premium text-dark ms-2">Default</span>}
                          </span>
                          <span className="text-secondary">{addr.city}, {addr.state} {addr.zipCode}, {addr.country}</span>
                        </div>
                      </label>
                      <button type="button" onClick={() => handleDeleteAddress(addr.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                      >
                        <i className="bi bi-trash fs-5"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-light rounded border border-dashed border-secondary border-opacity-25">
                  <p className="text-secondary small mb-3">No saved addresses found. Please add a shipping address to checkout.</p>
                  <button onClick={() => setShowAddressForm(true)} className="btn btn-premium rounded-pill px-4">
                    Add New Address
                  </button>
                </div>
              )
            )}
          </div>

          {/* Payment Method Section */}
          <div className="glass-panel p-4">
            <h5 className="fw-bold mb-3">2. Payment Method</h5>
            
            <div className="d-flex flex-column gap-3">
              <label className="d-flex gap-3 p-3 rounded border border-secondary border-opacity-10 cursor-pointer align-items-center bg-light">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                />
                <div className="small">
                  <span className="fw-bold d-block"><i className="bi bi-cash-coin me-1"></i> Cash On Delivery</span>
                  <span className="text-secondary">Pay with cash when package is delivered.</span>
                </div>
              </label>

              <label className="d-flex gap-3 p-3 rounded border border-secondary border-opacity-10 cursor-pointer align-items-center bg-light">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="STRIPE"
                  checked={paymentMethod === 'STRIPE'}
                  onChange={() => setPaymentMethod('STRIPE')}
                />
                <div className="small">
                  <span className="fw-bold d-block"><i className="bi bi-credit-card me-1"></i> Credit Card (Stripe Mockup)</span>
                  <span className="text-secondary">Pay securely online with credit or debit cards.</span>
                </div>
              </label>

              {paymentMethod === 'STRIPE' && (
                <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-10 mt-2">
                  <h6 className="fw-bold mb-3 small">
                    <i className="bi bi-lock me-1"></i> Card Information 
                    {isMockMode && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>Demo Fallback Mode</span>}
                  </h6>
                  
                  {isMockMode ? (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-secondary">Card Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="4242 4242 4242 4242"
                          value={mockCardNumber}
                          onChange={(e) => setMockCardNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Expiry Date</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={mockCardExpiry}
                          onChange={(e) => setMockCardExpiry(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">CVV</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="123"
                          maxLength="3"
                          value={mockCardCvv}
                          onChange={(e) => setMockCardCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <div className="form-control p-3 bg-white" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                        <CardElement options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: 'var(--text-primary)',
                              fontFamily: 'Inter, system-ui, sans-serif',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                            invalid: {
                              color: '#dc3545',
                            },
                          },
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Order Summary */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 sticky-lg-top" style={{ top: '100px', zIndex: 1 }}>
            <h5 className="fw-bold mb-4">Review Order</h5>
            
            {/* Short item list */}
            {cart && (
              <div className="d-flex flex-column gap-2 mb-4 max-h-40 overflow-y-auto" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="d-flex align-items-center gap-2 pb-2 border-bottom border-secondary border-opacity-5">
                    <img src={item.product.imageUrl} alt={item.product.name} className="rounded object-fit-cover" style={{ width: '40px', height: '50px' }} />
                    <div className="flex-grow-1 min-w-0">
                      <span className="d-block text-truncate small fw-bold">{item.product.name}</span>
                      <span className="text-muted small fs-xs">Qty: {item.quantity}</span>
                    </div>
                    <span className="small fw-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between text-secondary small">
                <span>Subtotal ({itemsCount} items)</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small">
                <span>Shipping</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>
              {coupon && (
                <div className="d-flex justify-content-between text-success small fw-semibold">
                  <span>Coupon discount ({coupon.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-secondary opacity-25 my-1" />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Grand Total</span>
                <span className="text-gradient">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkingOut || !selectedAddressId}
              className="btn btn-premium w-100 rounded-pill py-3 fw-bold shadow-sm"
            >
              {checkingOut ? (
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Processing Checkout...</span>
                </div>
              ) : (
                'Place Order'
              )}
            </button>
            
            <div className="text-center mt-3">
              <Link to="/cart" className="text-decoration-none text-muted small hover-text-primary">
                Return to Shopping Bag
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutWrapper = () => {
  const [stripeKey, setStripeKey] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await api.get('/payment/config');
        const key = res.data.publishableKey;
        setStripeKey(key);
        // If it matches the default placeholder key, trigger isMockMode fallback
        if (key === 'pk_test_51OPk6GSAFyEExz2lFz3b3P1Qd52vA5aL9vP3J8dG8X4L9oH8U7Y6T5R4E3W2Q1' || !key) {
          setIsMockMode(true);
        }
      } catch (err) {
        console.error('Failed to load Stripe publishable key:', err);
        setIsMockMode(true);
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading configuration...</span>
        </div>
      </div>
    );
  }

  // Always wrap in Elements provider (even in mock mode) to prevent useStripe/useElements context crashes
  const activeKey = stripeKey || 'pk_test_51OPk6GSAFyEExz2lFz3b3P1Qd52vA5aL9vP3J8dG8X4L9oH8U7Y6T5R4E3W2Q1';
  const stripePromise = getStripe(activeKey);

  return (
    <Elements stripe={stripePromise}>
      <Checkout isMockMode={isMockMode} />
    </Elements>
  );
};

export default CheckoutWrapper;
