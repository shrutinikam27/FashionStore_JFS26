import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';

// Customer Protected Pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Agency Pages
import AgencyDashboard from './pages/agency/AgencyDashboard';

// Customer Protected Route Wrapper
const CustomerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
};

// Admin Protected Route Wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
};

// Delivery Protected Route Wrapper
const DeliveryRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'DELIVERY_PERSON') return <Navigate to="/" replace />;
  return children;
};

// Agency Protected Route Wrapper
const AgencyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'AGENCY') return <Navigate to="/" replace />;
  return children;
};

const ToastAlert = () => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handleAlert = (e) => {
      setAlert(e.detail);
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('cart-alert', handleAlert);
    return () => window.removeEventListener('cart-alert', handleAlert);
  }, []);

  if (!alert) return null;

  return (
    <div 
      className="position-fixed top-4 end-4 glass-panel p-3 text-white border-0 shadow-lg d-flex align-items-center gap-2"
      style={{
        zIndex: 9999,
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        borderRadius: '30px',
        right: '24px',
        top: '24px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <i className="bi bi-check2-circle fs-5"></i>
      <span className="fw-semibold small">{alert}</span>
    </div>
  );
};

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer Routes */}
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
          <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
          <Route path="/wishlist" element={<CustomerRoute><Wishlist /></CustomerRoute>} />
          <Route path="/profile" element={<CustomerRoute><Profile /></CustomerRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

          {/* Delivery Routes */}
          <Route path="/delivery" element={<DeliveryRoute><DeliveryDashboard /></DeliveryRoute>} />

          {/* Agency Routes */}
          <Route path="/agency" element={<AgencyRoute><AgencyDashboard /></AgencyRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastAlert />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
