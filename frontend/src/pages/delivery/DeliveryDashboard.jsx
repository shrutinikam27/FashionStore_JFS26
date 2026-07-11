import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext';
import OrderTimeline from '../../components/OrderTimeline';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, SHIPPED, DELIVERED

  const fetchAssignedOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/delivery/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching assigned deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/delivery/orders/${orderId}/status`, { status: nextStatus });
      // Refresh list
      const response = await api.get('/delivery/orders');
      setOrders(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculations
  const totalAssigned = orders.length;
  const pendingDeliveries = orders.filter(o => o.status === 'PENDING' || o.status === 'SHIPPED').length;
  const completedDeliveries = orders.filter(o => o.status === 'DELIVERED').length;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return o.status === 'PENDING';
    if (filterStatus === 'SHIPPED') return o.status === 'SHIPPED';
    if (filterStatus === 'DELIVERED') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="container py-4">
      {/* Header Profile Dashboard */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold tracking-tight text-gradient mb-1">Delivery Agent Portal</h2>
          <p className="text-secondary small mb-0">Logged in as: <strong className="text-dark">{user?.firstName} {user?.lastName}</strong> ({user?.email})</p>
        </div>
        <button onClick={logout} className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 fw-semibold align-self-start">
          <i className="bi bi-box-arrow-right me-1"></i> Sign Out
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center border-start border-primary border-4">
            <span className="text-secondary small fw-bold text-uppercase d-block mb-1">Total Assigned Task</span>
            <h2 className="fw-bold mb-0 text-primary">{totalAssigned}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center border-start border-warning border-4">
            <span className="text-secondary small fw-bold text-uppercase d-block mb-1">Pending Shipments</span>
            <h2 className="fw-bold mb-0 text-warning">{pendingDeliveries}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-panel p-4 text-center border-start border-success border-4">
            <span className="text-secondary small fw-bold text-uppercase d-block mb-1">Completed Deliveries</span>
            <h2 className="fw-bold mb-0 text-success">{completedDeliveries}</h2>
          </div>
        </div>
      </div>

      {/* Task Filters */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <span className="small text-secondary fw-semibold">Filter:</span>
        {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`btn btn-sm rounded-pill px-3 py-1 ${
              filterStatus === status ? 'btn-premium' : 'btn-light border'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      <div className="glass-panel p-4">
        <h4 className="fw-bold mb-4">Active Consignment Log</h4>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr className="small text-secondary">
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Ship To Address</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredOrders.map((order) => {
                  const isExpanded = selectedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}>
                        <td className="fw-bold text-primary">#{order.id}</td>
                        <td>
                          <span className="fw-bold d-block">{order.user?.firstName} {order.user?.lastName}</span>
                          <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{order.user?.email}</span>
                        </td>
                        <td>
                          {order.shippingAddress ? (
                            <span className="text-truncate d-block" style={{ maxWidth: '250px' }} title={`${order.shippingAddress.street}, ${order.shippingAddress.city}`}>
                              {order.shippingAddress.street}, {order.shippingAddress.city}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="fw-bold">${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'DELIVERED' 
                              ? 'bg-success' 
                              : order.status === 'CANCELLED' 
                              ? 'bg-danger' 
                              : order.status === 'SHIPPED' 
                              ? 'bg-warning text-dark' 
                              : 'bg-info'
                          } px-2.5 py-1 text-white`}>
                            {order.status === 'SHIPPED' ? 'OUT FOR DELIVERY' : order.status}
                          </span>
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelectedOrderId(isExpanded ? null : order.id)} className="btn btn-sm btn-light border">
                            {isExpanded ? 'Collapse' : 'Manage'}
                          </button>
                        </td>
                      </tr>

                      {/* Detail Expansion Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="bg-light bg-opacity-50 p-4">
                            <div className="row g-4" onClick={(e) => e.stopPropagation()}>
                              <div className="col-md-6">
                                <h6 className="fw-bold mb-3">Delivery Information</h6>
                                <div className="mb-2">
                                  <strong className="d-block small">Address Details:</strong>
                                  <span className="text-secondary small">
                                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong className="d-block small">Contact Number:</strong>
                                  <span className="text-secondary small">{order.user?.phone || 'Not Provided'}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="d-block small">Payment Method & Status:</strong>
                                  <span className="text-secondary small">
                                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash On Delivery' : order.paymentMethod} ({order.paymentStatus})
                                  </span>
                                </div>
                                <div className="mb-3">
                                  <strong className="d-block small">Order Total:</strong>
                                  <span className="text-secondary small fw-bold">${order.totalAmount.toFixed(2)}</span>
                                </div>

                                <h6 className="fw-bold mb-3 small">Consignment Items</h6>
                                <div className="d-flex flex-column gap-2 mb-3">
                                  {order.orderItems?.map((item) => (
                                    <div key={item.id} className="d-flex align-items-center gap-2">
                                      <img src={item.product?.imageUrl} alt={item.product?.name} className="rounded" style={{ width: '35px', height: '45px', objectFit: 'cover' }} />
                                      <div className="flex-grow-1 min-w-0">
                                        <span className="small fw-bold d-block text-truncate">{item.product?.name}</span>
                                        <span className="text-muted small">Qty: {item.quantity} {item.size && `(Size: ${item.size})`}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="col-md-6">
                                <h6 className="fw-bold mb-3">Update Tracking Status</h6>
                                {order.status === 'DELIVERED' ? (
                                  <div className="alert alert-success d-flex align-items-center gap-2 rounded p-3 mb-4">
                                    <i className="bi bi-check2-circle fs-5"></i>
                                    <span className="small fw-semibold">This consignment has been successfully delivered.</span>
                                  </div>
                                ) : order.status === 'CANCELLED' ? (
                                  <div className="alert alert-danger d-flex align-items-center gap-2 rounded p-3 mb-4">
                                    <i className="bi bi-x-circle fs-5"></i>
                                    <span className="small fw-semibold">This order was cancelled and cannot be modified.</span>
                                  </div>
                                ) : (
                                  <div className="d-flex flex-wrap gap-2 mb-4">
                                    {order.status === 'PENDING' && (
                                      <button 
                                        onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                                        disabled={updatingId === order.id}
                                        className="btn btn-warning text-dark btn-sm rounded-pill px-3 py-2 fw-semibold"
                                      >
                                        {updatingId === order.id ? 'Updating...' : 'Mark Out For Delivery'}
                                      </button>
                                    )}
                                    {(order.status === 'PENDING' || order.status === 'SHIPPED') && (
                                      <button 
                                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                                        disabled={updatingId === order.id}
                                        className="btn btn-success btn-sm rounded-pill px-3 py-2 fw-semibold"
                                      >
                                        {updatingId === order.id ? 'Updating...' : 'Mark Delivered'}
                                      </button>
                                    )}
                                  </div>
                                )}

                                <h6 className="fw-bold mb-3 small">Tracking Timeline</h6>
                                <OrderTimeline order={order} />
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
          <div className="text-center py-5 bg-light rounded border border-secondary border-opacity-10">
            <p className="text-secondary small mb-0">No assigned consignments found in this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
