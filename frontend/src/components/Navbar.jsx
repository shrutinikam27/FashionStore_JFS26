import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { itemsCount, wishlistCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top glass-panel px-4 py-3 mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-3 text-gradient tracking-tight" to="/">
          FASHION STORE
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/shop">
                Shop
              </Link>
            </li>
            {user && user.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 text-primary" to="/admin">
                  <i className="bi bi-speedometer2 me-1"></i> Admin Panel
                </Link>
              </li>
            )}
            {user && user.role === 'DELIVERY_PERSON' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 text-warning" to="/delivery">
                  <i className="bi bi-truck me-1"></i> Delivery Portal
                </Link>
              </li>
            )}
            {user && user.role === 'AGENCY' && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 text-warning" to="/agency">
                  <i className="bi bi-shop me-1"></i> Agency Portal
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-link nav-link p-2"
              title="Toggle Theme"
              style={{ cursor: 'pointer' }}
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill fs-4 text-secondary"></i>
              ) : (
                <i className="bi bi-sun-fill fs-4 text-warning"></i>
              )}
            </button>

            {/* Wishlist Link */}
            {user && user.role === 'CUSTOMER' && (
              <Link to="/wishlist" className="position-relative nav-link p-2">
                <i className="bi bi-heart fs-4"></i>
                {wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link */}
            {user && user.role === 'CUSTOMER' && (
              <Link to="/cart" className="position-relative nav-link p-2 me-2">
                <i className="bi bi-bag fs-4"></i>
                {itemsCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                    {itemsCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Session options */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>Hi, {user.firstName}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item rounded" to="/profile">
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                  </li>
                  {user.role === 'CUSTOMER' && (
                    <li>
                      <Link className="dropdown-item rounded" to="/profile#orders">
                        <i className="bi bi-receipt me-2"></i> My Orders
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item rounded text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-premium-outline rounded-pill px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-premium rounded-pill px-4">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
