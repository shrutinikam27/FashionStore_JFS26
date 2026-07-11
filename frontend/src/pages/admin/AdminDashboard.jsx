import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import { api } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981'];

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <AdminSidebar />
        </div>

        {/* Dashboard Panels */}
        <div className="col-lg-9">
          <div className="mb-4">
            <h3 className="fw-bold">Dashboard Analytics</h3>
            <span className="small text-secondary">Real-time overview of store revenues, orders, and products.</span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : analytics ? (
            <div>
              {/* Stats Counters Grid */}
              <div className="row g-4 mb-5">
                <div className="col-md-3 col-6">
                  <div className="glass-card p-4 text-center">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-currency-dollar fs-4"></i>
                    </div>
                    <span className="small text-secondary fw-semibold">Total Revenue</span>
                    <h4 className="fw-bold mt-1 text-gradient">${analytics.totalSales.toFixed(2)}</h4>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="glass-card p-4 text-center">
                    <div className="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-cart-check fs-4"></i>
                    </div>
                    <span className="small text-secondary fw-semibold">Total Orders</span>
                    <h4 className="fw-bold mt-1 text-gradient">{analytics.totalOrders}</h4>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="glass-card p-4 text-center">
                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-box-seam fs-4"></i>
                    </div>
                    <span className="small text-secondary fw-semibold">Active Products</span>
                    <h4 className="fw-bold mt-1 text-gradient">{analytics.totalProducts}</h4>
                  </div>
                </div>

                <div className="col-md-3 col-6">
                  <div className="glass-card p-4 text-center">
                    <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-people fs-4"></i>
                    </div>
                    <span className="small text-secondary fw-semibold">Customers</span>
                    <h4 className="fw-bold mt-1 text-gradient">{analytics.totalUsers}</h4>
                  </div>
                </div>
              </div>

              {/* Recharts Sections */}
              <div className="row g-4">
                {/* Revenue Trend Area Chart */}
                <div className="col-lg-8">
                  <div className="glass-panel p-4">
                    <h5 className="fw-bold mb-4">Sales Revenue Trend</h5>
                    <div style={{ width: '100%', height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.salesByDate}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Categories Bar Chart */}
                <div className="col-lg-4">
                  <div className="glass-panel p-4">
                    <h5 className="fw-bold mb-4">Category Distribution</h5>
                    <div style={{ width: '100%', height: '300px' }}>
                      {analytics.salesByCategory && analytics.salesByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.salesByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="category" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: '8px' }} />
                            <Bar dataKey="sales" radius={[0, 10, 10, 0]} barSize={18}>
                              {analytics.salesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-5">
                          <span className="small text-secondary">No category data compiled.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel text-center p-5">
              <span className="text-danger small">Failed to load sales reports analytics.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
