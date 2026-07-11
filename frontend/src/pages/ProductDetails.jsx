import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const [prodRes, reviewsRes, recRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/reviews`),
        api.get(`/products/${id}/recommendations`),
      ]);
      setProduct(prodRes.data);
      setActiveImage(prodRes.data.imageUrl);
      setReviews(reviewsRes.data);
      setRecommendations(recRes.data);
      if (prodRes.data.sizes && prodRes.data.sizes.length > 0) {
        setSelectedSize(prodRes.data.sizes[0]);
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    setQty(1);
    setSelectedSize('');
    setComment('');
    setRating(5);
    setReviewMsg(null);
    setReviewError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setCartLoading(true);
    try {
      await addToCart(product.id, qty, selectedSize);
    } catch (err) {
      alert(err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewMsg(null);
    setReviewError(null);
    try {
      await api.post(`/products/${product.id}/reviews`, { rating, comment });
      setReviewMsg('Thank you! Your review has been added.');
      setComment('');
      setRating(5);
      const reviewsRes = await api.get(`/products/${product.id}/reviews`);
      setReviews(reviewsRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit. You may have already reviewed this product.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '52px', height: '52px',
              border: '4px solid var(--border-glass)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading product…</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-5">
        <div className="glass-panel p-5">
          <i className="bi bi-exclamation-circle fs-1" style={{ color: 'var(--danger)' }} />
          <h4 className="mt-3 fw-bold">Product Not Found</h4>
          <p style={{ color: 'var(--text-secondary)' }}>This product may have been removed or is no longer available.</p>
          <Link to="/shop" className="btn btn-premium rounded-pill px-4 mt-2">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const allImages = [product.imageUrl, ...(product.productImages?.map(i => i.imageUrl) || [])];

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>

      {/* Breadcrumb */}
      <nav className="mb-4" style={{ fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link to="/shop" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Shop</Link>
          {' / '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
        </span>
      </nav>

      {/* ── Product Top Section ── */}
      <div className="row g-4 g-md-5 mb-5">

        {/* Image Gallery */}
        <div className="col-md-6">
          <div className="glass-card p-3 d-flex flex-column gap-3">
            {/* Main image */}
            <div style={{
              height: '400px',
              borderRadius: 'var(--border-radius-sm)',
              overflow: 'hidden',
              background: 'var(--bg-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={activeImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
              />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '72px', height: '72px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${activeImage === img ? 'var(--primary)' : 'var(--border-glass)'}`,
                      transition: 'border-color 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="col-md-6 d-flex flex-column">
          {/* Brand badge */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '100px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {product.brand?.name || 'Brand'}
            </span>
            <span style={{
              marginLeft: '8px',
              display: 'inline-block',
              background: 'rgba(99,102,241,0.06)',
              color: 'var(--text-muted)',
              borderRadius: '100px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}>
              {product.category?.name}
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            {product.name}
          </h1>

          {/* Star ratings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={`bi ${i < Math.round(avgRating) ? 'bi-star-fill' : 'bi-star'}`}
                   style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
              ))}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
              {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div style={{
            fontSize: '2rem', fontWeight: 800, marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            ${product.price.toFixed(2)}
          </div>

          {/* Description */}
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, fontSize: '0.93rem' }}>
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* Stock status */}
          <div style={{ marginBottom: '1.5rem' }}>
            {product.stockQuantity > 0 ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                borderRadius: '100px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700,
              }}>
                <i className="bi bi-check-circle-fill" />
                In Stock — {product.stockQuantity} remaining
              </span>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                borderRadius: '100px', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 700,
              }}>
                <i className="bi bi-x-circle-fill" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Size Options Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h6 className="filter-label" style={{ marginBottom: '0.65rem' }}>Select Size</h6>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map((sz) => {
                  const isSelected = sz === selectedSize;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '30px',
                        border: isSelected ? 'none' : '1px solid var(--border-glass)',
                        background: isSelected 
                          ? 'linear-gradient(135deg, var(--primary), var(--secondary))' 
                          : 'var(--bg-secondary)',
                        color: isSelected ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                        transition: 'var(--transition-smooth)',
                        minWidth: '50px',
                        textAlign: 'center'
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Qty + Add to Cart */}
          {(!user || user.role !== 'ADMIN') && product.stockQuantity > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginTop: 'auto' }}>
              {/* Qty Selector */}
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
                  <i className="bi bi-dash-lg" />
                </button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))} disabled={qty >= product.stockQuantity}>
                  <i className="bi bi-plus-lg" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="btn btn-premium rounded-pill d-flex align-items-center gap-2"
                style={{ flexGrow: 1, justifyContent: 'center', padding: '0.85rem 1.5rem' }}
              >
                {cartLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" />
                ) : (
                  <>
                    <i className="bi bi-bag-plus-fill" />
                    Add {qty > 1 ? `${qty} items` : 'to Bag'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Delivery info chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1.5rem' }}>
            {[
              { icon: 'bi-truck', text: 'Free Shipping over $50' },
              { icon: 'bi-arrow-return-left', text: '30-Day Returns' },
              { icon: 'bi-shield-check', text: 'Secure Checkout' },
            ].map(({ icon, text }) => (
              <span key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'var(--primary-light)', color: 'var(--primary)',
                borderRadius: '100px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600,
              }}>
                <i className={`bi ${icon}`} /> {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="row g-4 g-md-5 mb-5">
        <div className="col-lg-7">
          <h4 style={{ fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Customer Reviews
            {reviews.length > 0 && (
              <span style={{
                marginLeft: '10px', fontSize: '0.8rem', fontWeight: 600,
                background: 'var(--primary-light)', color: 'var(--primary)',
                borderRadius: '100px', padding: '3px 10px', verticalAlign: 'middle',
              }}>
                {avgRating} ★
              </span>
            )}
          </h4>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div key={rev.id} className="glass-card p-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {rev.user?.firstName?.[0]}{rev.user?.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {rev.user?.firstName} {rev.user?.lastName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <i className="bi bi-patch-check-fill me-1" style={{ color: 'var(--primary)' }} />
                          Verified Buyer
                        </div>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'}`}
                         style={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.65 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel text-center p-5">
              <i className="bi bi-chat-square-heart" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', marginBottom: 0 }}>
                No reviews yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>

        {/* Write Review */}
        <div className="col-lg-5">
          <div className="glass-panel p-4">
            <h5 style={{ fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              <i className="bi bi-pencil-square me-2" style={{ color: 'var(--primary)' }} />
              Write a Review
            </h5>

            {user ? (
              user.role === 'ADMIN' ? (
                <div style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>
                  <i className="bi bi-info-circle me-1" />
                  Administrators cannot submit product reviews.
                </div>
              ) : (
                <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Star picker */}
                  <div>
                    <label className="filter-label">Your Rating</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setRating(score)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1.6rem', color: score <= rating ? '#f59e0b' : 'var(--border-glass)',
                            padding: '0 2px', transition: 'color 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#f59e0b'}
                          onMouseLeave={(e) => e.currentTarget.style.color = score <= rating ? '#f59e0b' : 'var(--border-glass)'}
                        >
                          <i className={`bi ${score <= rating ? 'bi-star-fill' : 'bi-star'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="filter-label">Your Comments</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Share your experience with this product…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {reviewMsg && (
                    <div style={{
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--success)', fontSize: '0.88rem',
                    }}>
                      <i className="bi bi-check-circle-fill me-1" /> {reviewMsg}
                    </div>
                  )}
                  {reviewError && (
                    <div style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px', padding: '0.75rem 1rem', color: 'var(--danger)', fontSize: '0.88rem',
                    }}>
                      <i className="bi bi-exclamation-circle me-1" /> {reviewError}
                    </div>
                  )}

                  <button type="submit" className="btn btn-premium rounded-pill py-3">
                    Submit Review
                  </button>
                </form>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <i className="bi bi-lock" style={{ fontSize: '2rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'block' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Log in to leave a review for this product.
                </p>
                <Link to="/login" className="btn btn-premium rounded-pill px-4">Log In</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── You May Also Like ── */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            You May Also Like
          </h4>
          <div className="row g-4">
            {recommendations.map((prod) => (
              <div key={prod.id} className="col-lg-3 col-md-6 col-6">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
