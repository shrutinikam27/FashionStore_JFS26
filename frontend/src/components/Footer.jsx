import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="glass-panel mt-5 px-4 py-5 rounded-top-lg rounded-bottom-0 border-bottom-0 border-start-0 border-end-0">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-3 text-gradient">FASHION STORE</h5>
            <p className="text-secondary mb-3">
              Discover the latest fashion trends and premium apparel. Curated styles for men, women, and accessories to elevate your wardrobe.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="bi bi-pinterest"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link className="text-decoration-none text-secondary" to="/shop?category=1">Men's Apparel</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/shop?category=2">Women's Apparel</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/shop?category=3">Accessories</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/shop?category=4">Footwear</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">Customer Care</h6>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a className="text-decoration-none text-secondary" href="#">Contact Us</a></li>
              <li><a className="text-decoration-none text-secondary" href="#">Size Guide</a></li>
              <li><a className="text-decoration-none text-secondary" href="#">Shipping & Returns</a></li>
              <li><a className="text-decoration-none text-secondary" href="#">FAQs</a></li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-3">Join the Club</h6>
            <p className="text-secondary mb-3">Subscribe to receive exclusive offers, early sale access, and style advice.</p>
            <form onSubmit={handleSubscribe} className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-premium px-3" type="submit">
                Subscribe
              </button>
            </form>
            {subscribed && (
              <div className="text-success small mt-2">
                <i className="bi bi-check-circle-fill me-1"></i> Subscribed successfully!
              </div>
            )}
          </div>
        </div>
        
        <hr className="my-4 border-secondary opacity-25" />
        
        <div className="d-flex flex-md-row flex-column justify-content-between align-items-center gap-2">
          <p className="text-secondary small mb-0">© 2026 Fashion Store Inc. All rights reserved.</p>
          <div className="d-flex gap-3 small">
            <a className="text-decoration-none text-secondary" href="#">Privacy Policy</a>
            <a className="text-decoration-none text-secondary" href="#">Terms of Use</a>
            <a className="text-decoration-none text-secondary" href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
