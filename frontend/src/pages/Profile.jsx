import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import OrderTimeline from '../components/OrderTimeline';

const Profile = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('settings'); // settings or orders
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(null);

  // Address form states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Trigger tab change based on URL hash
  useEffect(() => {
    if (location.hash === '#orders') {
      setActiveTab('orders');
    } else {
      setActiveTab('settings');
    }
  }, [location.hash]);

  // Load profile details
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const addrRes = await api.get('/addresses');
        setAddresses(addrRes.data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user]);

  // Load orders when orders tab active
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || activeTab !== 'orders') return;
      setOrdersLoading(true);
      try {
        const ordRes = await api.get('/orders');
        setOrders(ordRes.data);
      } catch (err) {
        console.error('Error fetching order logs:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user, activeTab]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/addresses', {
        street,
        city,
        state,
        zipCode,
        country,
        isDefault: addresses.length === 0,
      });
      setAddresses([...addresses, response.data]);
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
    if (!window.confirm('Delete this shipping address?')) return;
    try {
      await api.delete(`/addresses/${addrId}`);
      setAddresses(addresses.filter(a => a.id !== addrId));
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setPdfLoading(orderId);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob', // Critical for streaming binary bytes!
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up DOM references
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download invoice receipt.');
    } finally {
      setPdfLoading(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully.');
      // Refresh order list
      const ordRes = await api.get('/orders');
      setOrders(ordRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };


  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Please log in to view your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row g-4">
        {/* Profile Sidebar */}
        <div className="col-lg-3 profile-sidebar">
          <div className="glass-panel p-4 text-center mb-4">
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', color: '#fff', fontSize: '2rem'
              }}>
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user.firstName} {user.lastName}</h5>
            <span style={{
              display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)',
              borderRadius: '100px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem'
            }}>{user.role}</span>

            <div className="d-flex flex-column gap-2 text-start">
              <button
                onClick={() => { setActiveTab('settings'); navigate('/profile'); }}
                className="sidebar-nav-btn"
                style={activeTab === 'settings' ? {
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#ffffff', boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                } : {}}
              >
                <i className="bi bi-gear"></i> Settings
              </button>

              {user.role !== 'ADMIN' && (
                <button
                  onClick={() => { setActiveTab('orders'); navigate('/profile#orders'); }}
                  className="sidebar-nav-btn"
                  style={activeTab === 'orders' ? {
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: '#ffffff', boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                  } : {}}
                >
                  <i className="bi bi-receipt"></i> Order History
                </button>
              )}

              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="sidebar-nav-btn"
                style={{ color: 'var(--danger)' }}
              >
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Details Panel */}
        <div className="col-lg-9">
          {activeTab === 'settings' ? (
            <div className="d-flex flex-column gap-4">
              {/* Account Credentials */}
              <div className="glass-panel p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-shield-lock me-1"></i> Account Profile</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <span className="small text-secondary fw-semibold">First Name</span>
                    <p className="fw-bold mb-0">{user.firstName}</p>
                  </div>
                  <div className="col-md-6">
                    <span className="small text-secondary fw-semibold">Last Name</span>
                    <p className="fw-bold mb-0">{user.lastName}</p>
                  </div>
                  <div className="col-md-6">
                    <span className="small text-secondary fw-semibold">Email Address</span>
                    <p className="fw-bold mb-0">{user.email}</p>
                  </div>
                  <div className="col-md-6">
                    <span className="small text-secondary fw-semibold">Phone Number</span>
                    <p className="fw-bold mb-0">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address list */}
              {user.role !== 'ADMIN' && (
                <div className="glass-panel p-4">
                  <h5 className="fw-bold mb-4"><i className="bi bi-geo-alt me-1"></i> Shipping Addresses</h5>
                  
                  <div className="row g-4">
                    {/* Add Address Form */}
                    <div className="col-md-5">
                      <h6 className="fw-bold mb-3 small">Add New Address</h6>
                      <form onSubmit={handleAddAddress} className="d-flex flex-column gap-3">
                        <input type="text" className="form-control py-2" placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required />
                        <input type="text" className="form-control py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                        <input type="text" className="form-control py-2" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                        <input type="text" className="form-control py-2" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                        <select className="form-select py-2" value={country} onChange={(e) => setCountry(e.target.value)}>
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="India">India</option>
                        </select>
                        <button type="submit" className="btn btn-premium rounded-pill py-2 mt-1">Save Address</button>
                      </form>
                    </div>

                    {/* Address List */}
                    <div className="col-md-7 border-start border-secondary border-opacity-10 pl-md-4">
                      <h6 className="fw-bold mb-3 small">Saved Addresses</h6>
                      {loading ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                      ) : addresses.length > 0 ? (
                        <div className="d-flex flex-column gap-3">
                          {addresses.map((addr) => (
                            <div key={addr.id} className="addr-card">
                              <div style={{ fontSize: '0.88rem' }}>
                                <span style={{ fontWeight: 700, display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                  {addr.street}
                                  {addr.isDefault && (
                                    <span style={{
                                      marginLeft: '8px', background: 'var(--primary-light)', color: 'var(--primary)',
                                      borderRadius: '100px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700
                                    }}>Default</span>
                                  )}
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{addr.city}, {addr.state} {addr.zipCode}, {addr.country}</span>
                              </div>
                              <button onClick={() => handleDeleteAddress(addr.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                              >
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="small text-secondary">No shipping addresses saved.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Orders Tab Panel */
            <div className="glass-panel p-4">
              <h5 className="fw-bold mb-4"><i className="bi bi-receipt me-1"></i> Order Logs</h5>
              
              {ordersLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr className="small text-secondary">
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {orders.map((order) => {
                        const isExpanded = selectedOrder?.id === order.id;
                        
                        return (
                          <React.Fragment key={order.id}>
                            <tr style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(isExpanded ? null : order)}>
                              <td className="fw-bold text-primary">#{order.id}</td>
                              <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                              <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                              <td>
                                <span className={`badge ${order.paymentStatus === 'PAID' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'} px-2.5 py-1`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${order.status === 'DELIVERED' ? 'bg-success' : order.status === 'CANCELLED' ? 'bg-danger' : 'bg-info'} px-2.5 py-1 text-white`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="d-flex justify-content-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => setSelectedOrder(isExpanded ? null : order)} className="btn btn-sm btn-light border">
                                    {isExpanded ? 'Collapse' : 'Track'}
                                  </button>
                                  <button 
                                    onClick={() => handleDownloadInvoice(order.id)} 
                                    className="btn btn-sm btn-premium-outline px-2.5 py-1"
                                    disabled={pdfLoading === order.id}
                                  >
                                    {pdfLoading === order.id ? (
                                      <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                      <><i className="bi bi-file-pdf me-1"></i> Invoice</>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Order Details Row */}
                            {isExpanded && (
                              <tr>
                                <td colSpan="6" className="order-expanded-row p-4">
                                  <div className="row g-4">
                                    <div className="col-md-6">
                                      <h6 className="fw-bold mb-3 small">Items Purchased</h6>
                                      <div className="d-flex flex-column gap-2 mb-3">
                                        {order.orderItems.map((item) => (
                                          <div key={item.id} className="d-flex align-items-center gap-3">
                                            <img src={item.product?.imageUrl} alt={item.product?.name} className="rounded" style={{ width: '40px', height: '50px', objectFit: 'cover' }} />
                                            <div className="flex-grow-1 min-w-0">
                                              <span className="small fw-bold d-block text-truncate">{item.product?.name}</span>
                                              <span className="text-muted small">
                                                Qty: {item.quantity} x ${item.price.toFixed(2)}
                                                {item.size && <span className="ms-2 badge bg-secondary badge-premium text-dark" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>Size: {item.size}</span>}
                                              </span>
                                            </div>
                                            <span className="small fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div className="pt-2 border-top border-secondary border-opacity-10 small">
                                        <div className="d-flex justify-content-between text-secondary mb-1">
                                          <span>Discount:</span>
                                          <span>-${order.discountAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between fw-bold text-primary">
                                          <span>Grand Total:</span>
                                          <span>${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="col-md-6">
                                      <h6 className="fw-bold mb-3 small">Shipment Status Timeline</h6>
                                      <div className="mb-4">
                                        <OrderTimeline order={order} />
                                      </div>
                                      {order.status === 'PENDING' && (
                                        <button 
                                          onClick={() => handleCancelOrder(order.id)}
                                          className="btn btn-danger btn-sm rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-1.5"
                                          style={{ fontSize: '0.82rem' }}
                                        >
                                          <i className="bi bi-x-circle"></i> Cancel Order
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center', padding: '3rem 2rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--border-radius-md)'
                }}>
                  <i className="bi bi-receipt" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>You have no order history yet.</p>
                  <a href="/shop" className="btn btn-premium rounded-pill px-4 mt-3" style={{ display: 'inline-block' }}>Start Shopping</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
