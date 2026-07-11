import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { api } from '../../context/AuthContext';
import OrderTimeline from '../../components/OrderTimeline';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [updatingId, setUpdatingId] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const response = await api.get('/admin/delivery-persons');
      setDeliveryPersons(response.data);
    } catch (err) {
      console.error('Error fetching delivery agents:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      alert(`Order status updated to ${newStatus}`);
      // Refresh list
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeliveryPersonChange = async (orderId, deliveryPersonId) => {
    setUpdatingId(orderId);
    try {
      const url = `/admin/orders/${orderId}/delivery-person` + (deliveryPersonId ? `?deliveryPersonId=${deliveryPersonId}` : '');
      await api.put(url);
      alert('Delivery agent assigned successfully');
      // Refresh list
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign delivery agent');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setPdfLoading(orderId);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download invoice receipt');
    } finally {
      setPdfLoading(null);
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <AdminSidebar />
        </div>

        {/* Orders Log Area */}
        <div className="col-lg-9">
          <div className="mb-4">
            <h3 className="fw-bold">Order Management</h3>
            <span className="small text-secondary">Monitor checkouts, print invoice receipts, and update tracking timeline steps.</span>
          </div>

          <div className="glass-panel p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr className="small text-secondary">
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Date</th>
                      <th>Grand Total</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {orders.map((order) => {
                      const isExpanded = selectedOrderId === order.id;
                      
                      return (
                        <React.Fragment key={order.id}>
                          <tr style={{ cursor: 'pointer' }} onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}>
                            <td className="fw-bold text-primary">#{order.id}</td>
                            <td>
                              <span className="fw-bold d-block">{order.user?.firstName} {order.user?.lastName}</span>
                              <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{order.user?.email}</span>
                              {order.paymentMethod && (
                                <span className="badge bg-secondary text-dark mt-1" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                  {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD (Cash)' : order.paymentMethod}
                                </span>
                              )}
                            </td>
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
                            <td className="text-end" onClick={(e) => e.stopPropagation()}>
                              <div className="d-flex justify-content-end gap-2">
                                <button onClick={() => setSelectedOrderId(isExpanded ? null : order.id)} className="btn btn-sm btn-light border">
                                  {isExpanded ? 'Collapse' : 'Manage'}
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

                          {/* Expanded details row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="7" className="order-expanded-row p-4">
                                <div className="row g-4" onClick={(e) => e.stopPropagation()}>
                                  <div className="col-md-6">
                                    <h6 className="fw-bold mb-3 small">Order Items</h6>
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
                                    
                                    <div className="pt-2 border-top border-secondary border-opacity-10 small mb-3">
                                      <div className="d-flex justify-content-between text-secondary mb-1">
                                        <span>Discount Amount:</span>
                                        <span>-${order.discountAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="d-flex justify-content-between fw-bold text-primary">
                                        <span>Grand Total:</span>
                                        <span>${order.totalAmount.toFixed(2)}</span>
                                      </div>
                                    </div>

                                    {order.shippingAddress && (
                                      <div className="mb-2 small">
                                        <span className="fw-bold d-block">Shipping Destination:</span>
                                        <span className="text-secondary">
                                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="col-md-6">
                                    <h6 className="fw-bold mb-3 small">Update Order Status</h6>
                                    
                                    <div className="mb-4">
                                      <select
                                        className="form-select w-100 mb-3"
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        disabled={updatingId === order.id || order.status === 'CANCELLED'}
                                      >
                                        <option value="PENDING">PENDING</option>
                                        <option value="SHIPPED">SHIPPED</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                      </select>
                                    </div>

                                    <h6 className="fw-bold mb-3 small">Assign Delivery Agent</h6>
                                    <div className="mb-4">
                                      <select
                                        className="form-select w-100"
                                        value={order.deliveryPerson?.id || ''}
                                        onChange={(e) => handleDeliveryPersonChange(order.id, e.target.value)}
                                        disabled={updatingId === order.id}
                                      >
                                        <option value="">Unassigned</option>
                                        {deliveryPersons.map(dp => (
                                          <option key={dp.id} value={dp.id}>{dp.firstName} {dp.lastName} ({dp.email})</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <h6 className="fw-bold mb-3 small">Tracking Progress</h6>
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
              <div className="text-center py-4 bg-light rounded border border-secondary border-opacity-10">
                <p className="text-secondary small mb-0">No customer orders placed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
