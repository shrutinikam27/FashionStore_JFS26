import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      setWishlistItems(response.data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistRemove = (productId) => {
    setWishlistItems(wishlistItems.filter((item) => item.product.id !== productId));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="fw-bold mb-4">My Wishlist</h3>

      {wishlistItems.length > 0 ? (
        <div className="row g-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="col-lg-3 col-md-6 col-6">
              <ProductCard
                product={item.product}
                isWishlistPage={true}
                onWishlistRemove={handleWishlistRemove}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="glass-panel p-5 max-w-md mx-auto" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <i className="bi bi-heartbreak text-secondary display-3 mb-3"></i>
            <h4 className="fw-bold">Your Wishlist is Empty</h4>
            <p className="text-secondary small mb-4">
              Add your favorite fits to your wishlist to keep track of them and buy them later.
            </p>
            <Link to="/shop" className="btn btn-premium rounded-pill px-4">
              Explore Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
