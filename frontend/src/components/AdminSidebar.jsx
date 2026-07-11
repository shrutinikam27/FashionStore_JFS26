import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const activePath = location.pathname;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'bi-speedometer2' },
    { name: 'Products', path: '/admin/products', icon: 'bi-grid-3x3-gap' },
    { name: 'Orders', path: '/admin/orders', icon: 'bi-receipt-cutoff' },
    { name: 'Coupons', path: '/admin/coupons', icon: 'bi-ticket-perforated' },
    { name: 'Users', path: '/admin/users', icon: 'bi-people' },
  ];

  return (
    <div className="glass-panel p-4 h-100 d-flex flex-column" style={{ minHeight: '80vh' }}>
      <div className="mb-4">
        <h5 className="fw-bold text-gradient text-center pb-2 border-bottom border-secondary border-opacity-25">
          ADMIN CENTER
        </h5>
      </div>
      
      <ul className="nav nav-pills flex-column gap-2 mb-auto">
        {menuItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center gap-3 py-2.5 px-3 rounded-pill fw-semibold ${
                  isActive 
                    ? 'active bg-gradient-premium' 
                    : 'text-secondary hover-bg-light'
                }`}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
        <Link to="/" className="btn btn-premium-outline w-100 rounded-pill py-2.5 d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-shop"></i>
          <span>View Customer Store</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
