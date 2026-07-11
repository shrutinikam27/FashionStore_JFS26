import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, isWishlistPage = false, onWishlistRemove = null }) => {
  const { user } = useAuth();
  const { addToCart, fetchWishlist } = useCart();
  const navigate = useNavigate();
  
  const [inWishlist, setInWishlist] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if item is in user's wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || user.role === 'ADMIN') return;
      try {
        const response = await api.get('/wishlist');
        const list = response.data;
        const found = list.some((item) => item.product.id === product.id);
        setInWishlist(found);
      } catch (err) {
        console.error('Error checking wishlist:', err);
      }
    };
    checkWishlist();
  }, [product.id, user]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setCartLoading(true);
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (inWishlist || isWishlistPage) {
        await api.delete(`/wishlist/${product.id}`);
        setInWishlist(false);
        if (onWishlistRemove) {
          onWishlistRemove(product.id);
        }
      } else {
        await api.post(`/wishlist/${product.id}`);
        setInWishlist(true);
      }
      fetchWishlist();
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="glass-card h-100 position-relative">
      {/* Product Image */}
      <Link to={`/products/${product.id}`}>
        <div style={{ position: 'relative', overflow: 'hidden', height: '260px' }}>
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'}
            alt={product.name}
            className="w-100 h-100 object-fit-cover transition-all"
            style={{ transition: 'transform 0.5s ease' }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <span className="position-absolute top-2 start-2 badge bg-warning badge-premium text-dark">
              Only {product.stockQuantity} Left
            </span>
          )}
          {product.stockQuantity === 0 && (
            <span className="position-absolute top-2 start-2 badge bg-danger badge-premium">
              Out Of Stock
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist Button Overlay */}
      {(!user || user.role !== 'ADMIN') && (
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="btn glass-panel position-absolute rounded-circle shadow-sm"
          style={{
            top: '12px',
            right: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            border: '1px solid var(--border-glass)',
          }}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? (
            <i className="bi bi-heart-fill text-danger fs-5"></i>
          ) : (
            <i className="bi bi-heart text-secondary fs-5"></i>
          )}
        </button>
      )}

      {/* Product Details */}
      <div className="p-3 d-flex flex-column" style={{ minHeight: '140px' }}>
        <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
          {product.category?.name || 'Category'}
        </span>
        <h6 className="fw-bold mb-1 mt-1 text-truncate">
          <Link to={`/products/${product.id}`} className="text-decoration-none text-primary">
            {product.name}
          </Link>
        </h6>
        <span className="text-secondary small mb-2">{product.brand?.name || 'Brand'}</span>
        
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bold fs-5 text-gradient">${product.price.toFixed(2)}</span>
          
          {(!user || user.role !== 'ADMIN') && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stockQuantity === 0}
              className="btn btn-premium px-3 py-2 rounded-pill d-flex align-items-center gap-1"
              title="Add to cart"
              style={{ fontSize: '0.85rem' }}
            >
              {cartLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <i className="bi bi-bag-plus"></i>
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
