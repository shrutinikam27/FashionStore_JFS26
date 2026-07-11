import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { api } from '../../context/AuthContext';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // PERCENTAGE, FLAT
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [active, setActive] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data);
    } catch (err) {
      console.error('Error loading coupon codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSaveCoupon = async (e) => {
    e.preventDefault();

    const payload = {
      code,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: parseFloat(minOrderAmount || 0),
      expiryDate: expiryDate || null,
      active
    };

    try {
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
        alert('Coupon updated successfully');
      } else {
        await api.post('/admin/coupons', payload);
        alert('Promo coupon created successfully');
      }
      handleResetForm();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save coupon details');
    }
  };

  const handleEditClick = (coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMinOrderAmount(String(coupon.minOrderAmount));
    setExpiryDate(coupon.expiryDate || '');
    setActive(coupon.active);
    setShowForm(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      alert('Coupon code deleted');
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderAmount('');
    setExpiryDate('');
    setActive(true);
    setShowForm(false);
  };

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <AdminSidebar />
        </div>

        {/* Coupons Panel Area */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">Coupon Management</h3>
              <span className="small text-secondary">Configure discounts, percentage rates, thresholds, and expiries.</span>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-premium rounded-pill px-4">
                + Add Promo Coupon
              </button>
            )}
          </div>

          {showForm ? (
            /* Create / Edit Form Card */
            <div className="glass-panel p-4 mb-4">
              <h5 className="fw-bold mb-4">{editingId ? 'Edit Coupon Settings' : 'Create Promo Coupon'}</h5>
              <form onSubmit={handleSaveCoupon} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Coupon Promo Code</label>
                  <input type="text" className="form-control" placeholder="SAVE20" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Discount Type</label>
                  <select className="form-select" value={discountType} onChange={(e) => setDiscountType(e.target.value)} required>
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FLAT">FLAT ($)</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Discount Value</label>
                  <input type="number" step="0.01" className="form-control" placeholder="10.00" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Minimum Order Amount ($)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="50.00" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Expiry Date</label>
                  <input type="date" className="form-control" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
                <div className="col-md-6 d-flex align-items-end mb-2.5">
                  <label className="d-flex gap-2 align-items-center cursor-pointer mb-2">
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    <span className="small fw-semibold text-secondary">Enable Coupon (Active)</span>
                  </label>
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                  <button type="button" onClick={handleResetForm} className="btn btn-link text-decoration-none text-muted">Cancel</button>
                  <button type="submit" className="btn btn-premium px-4 rounded-pill">Save Coupon</button>
                </div>
              </form>
            </div>
          ) : (
            /* Coupons Table List */
            <div className="glass-panel p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : coupons.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr className="small text-secondary">
                        <th>Promo Code</th>
                        <th>Discount Value</th>
                        <th>Min Order Threshold</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td className="fw-bold font-monospace text-primary">{coupon.code}</td>
                          <td>
                            {coupon.discountType === 'PERCENTAGE' 
                              ? `${coupon.discountValue}% Off` 
                              : `$${coupon.discountValue.toFixed(2)} Off`}
                          </td>
                          <td>${coupon.minOrderAmount.toFixed(2)}</td>
                          <td>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</td>
                          <td>
                            <span className={`badge ${coupon.active ? 'bg-success' : 'bg-danger'} px-2.5 py-1 text-white`}>
                              {coupon.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button onClick={() => handleEditClick(coupon)} className="btn btn-sm btn-light border py-1">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteCoupon(coupon.id)} className="btn btn-sm btn-outline-danger py-1">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 bg-light rounded border border-secondary border-opacity-10">
                  <p className="text-secondary small mb-0">No discount coupons found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
