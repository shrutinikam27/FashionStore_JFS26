import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { api } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error loading users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      alert(`User role updated to ${newRole}`);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleUser = async (userId, userEmail) => {
    if (userEmail === 'admin@fashionstore.com') {
      alert('Cannot disable the main seed administrator account.');
      return;
    }
    
    setToggleLoadingId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/toggle`);
      // Update local state
      setUsers(users.map(u => u.id === userId ? response.data : u));
    } catch (err) {
      alert('Failed to toggle user account status');
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <AdminSidebar />
        </div>

        {/* Users Auditing log list */}
        <div className="col-lg-9">
          <div className="mb-4">
            <h3 className="fw-bold">User Directory</h3>
            <span className="small text-secondary">Review registered user accounts, profiles, permissions, and toggle access states.</span>
          </div>

          <div className="glass-panel p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr className="small text-secondary">
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td className="fw-bold text-muted">#{item.id}</td>
                        <td className="fw-bold">{item.firstName} {item.lastName}</td>
                        <td>{item.email}</td>
                        <td>{item.phone || '-'}</td>
                        <td>
                          {item.email === 'admin@fashionstore.com' ? (
                            <span className="badge bg-primary px-2.5 py-1 text-white">ADMIN</span>
                          ) : (
                            <select
                              value={item.role}
                              onChange={(e) => handleRoleChange(item.id, e.target.value)}
                              className="form-select form-select-sm d-inline-block w-auto"
                              style={{ padding: '0.25rem 1.5rem 0.25rem 0.5rem', fontSize: '0.8rem' }}
                            >
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="DELIVERY_PERSON">DELIVERY_PERSON</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${item.enabled ? 'bg-success' : 'bg-danger'} px-2.5 py-1 text-white`}>
                            {item.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleToggleUser(item.id, item.email)}
                            disabled={toggleLoadingId === item.id || item.email === 'admin@fashionstore.com'}
                            className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                              item.enabled ? 'btn-outline-danger' : 'btn-outline-success'
                            }`}
                          >
                            {toggleLoadingId === item.id ? (
                              <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : item.enabled ? (
                              'Disable Access'
                            ) : (
                              'Enable Access'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded border border-secondary border-opacity-10">
                <p className="text-secondary small mb-0">No registered users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
