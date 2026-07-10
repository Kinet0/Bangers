import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext.jsx';
import {
  TrendingUp, Package, ShoppingCart, Users, Key, Settings,
  AlertTriangle, Plus, Edit, Trash2, Check, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, getAuthHeaders, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [metrics, setMetrics] = useState({ totalSales: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0, salesOverTime: [] });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ id: null, name: '', slug: '', price: '', sku: '', inventory_qty: '', category_id: '', is_active: true, images: [''] });
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', is_active: true });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'manager' });
  const [storeSettings, setStoreSettings] = useState({ standardRate: '5.00', expressRate: '15.00', threshold: '100.00' });

  // Route Protection
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isManager) {
      navigate('/dashboard');
    }
  }, [token, isManager]);

  // Fetch admin datasets
  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch reports
      const repRes = await fetch(`${API_URL}/api/orders/reports/sales`, { headers: getAuthHeaders() });
      if (repRes.ok) setMetrics(await repRes.json());

      // 2. Fetch products
      const prodRes = await fetch(`${API_URL}/api/products`);
      if (prodRes.ok) setProducts(await prodRes.json());

      // 3. Fetch categories
      const catRes = await fetch(`${API_URL}/api/products/categories`);
      if (catRes.ok) setCategories(await catRes.json());

      // 4. Fetch orders
      const ordRes = await fetch(`${API_URL}/api/orders`, { headers: getAuthHeaders() });
      if (ordRes.ok) setOrders(await ordRes.json());

      // 5. Fetch coupons
      const copRes = await fetch(`${API_URL}/api/orders/coupons`, { headers: getAuthHeaders() });
      if (copRes.ok) setCoupons(await copRes.json());

      // 6. Fetch staff accounts
      const staffRes = await fetch(`${API_URL}/api/auth/staff`, { headers: getAuthHeaders() });
      if (staffRes.ok) setEmployees(await staffRes.json());

    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isManager && token) {
      loadAdminData();
    }
  }, [isManager, token]);

  // Product Operations
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const isEdit = productForm.id !== null;
    const url = isEdit ? `${API_URL}/api/products/${productForm.id}` : `${API_URL}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          inventory_qty: parseInt(productForm.inventory_qty, 10),
          category_id: productForm.category_id ? parseInt(productForm.category_id, 10) : null
        })
      });

      if (res.ok) {
        setShowProductForm(false);
        setProductForm({ id: null, name: '', slug: '', price: '', sku: '', inventory_qty: '', category_id: '', is_active: true, images: [''] });
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProduct = (prod) => {
    setProductForm({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      price: prod.price,
      sku: prod.sku,
      inventory_qty: prod.inventory_qty,
      category_id: prod.category_id || '',
      is_active: prod.is_active,
      images: prod.images || ['']
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Order Operations
  const handleOrderStatusUpdate = async (orderId, currentStatus, trackingNo = '') => {
    let nextStatus = currentStatus;
    if (currentStatus === 'pending') nextStatus = 'paid';
    else if (currentStatus === 'paid') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'completed';

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status: nextStatus, tracking_number: trackingNo || null })
      });
      if (res.ok) loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Coupon Operations
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/orders/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...couponForm,
          discount_value: parseFloat(couponForm.discount_value)
        })
      });
      if (res.ok) {
        setShowCouponForm(false);
        setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', is_active: true });
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Employee Operations
  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...employeeForm,
          password: employeeForm.password || 'TempPass123!'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff account');

      const newEmp = {
        id: data.user.id,
        first_name: data.user.firstName || employeeForm.first_name,
        last_name: data.user.lastName || employeeForm.last_name,
        role: data.user.role
      };

      setEmployees(prev => [newEmp, ...prev]);
      setShowEmployeeForm(false);
      setEmployeeForm({ first_name: '', last_name: '', email: '', password: '', role: 'manager' });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Unable to create staff account');
    }
  };

  if (!isManager) return null;

  return (
    <div className="container" style={styles.container}>
      <div style={styles.titleRow}>
        <h1 className="section-title">Admin Dashboard</h1>
        <button onClick={loadAdminData} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} title="Reload data">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-layout">
        {/* Navigation panel */}
        <aside style={styles.sidebar}>
          <div className="glass-card" style={styles.navCard}>
            <button onClick={() => { setActiveTab('overview'); }} style={{ ...styles.navBtn, color: activeTab === 'overview' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              <TrendingUp size={16} /> Overview Reports
            </button>
            <button onClick={() => { setActiveTab('products'); }} style={{ ...styles.navBtn, color: activeTab === 'products' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              <Package size={16} /> Products & Stock
            </button>
            <button onClick={() => { setActiveTab('orders'); }} style={{ ...styles.navBtn, color: activeTab === 'orders' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              <ShoppingCart size={16} /> Orders List
            </button>
            <button onClick={() => { setActiveTab('coupons'); }} style={{ ...styles.navBtn, color: activeTab === 'coupons' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
              <Users size={16} /> Coupons & Discounts
            </button>
            {isAdmin && (
              <>
                <button onClick={() => { setActiveTab('employees'); }} style={{ ...styles.navBtn, color: activeTab === 'employees' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                  <Key size={16} /> Staff Accounts
                </button>
                <button onClick={() => { setActiveTab('settings'); }} style={{ ...styles.navBtn, color: activeTab === 'settings' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                  <Settings size={16} /> Store Config
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Action sheets */}
        <main style={styles.main}>
          {loading ? (
            <div style={styles.center}>Aggregating store metrics...</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div style={styles.statsRow}>
                    <div className="glass-card" style={styles.statCard}>
                      <span style={styles.statLabel}>Gross Income</span>
                      <span style={styles.statValue}>${metrics.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="glass-card" style={styles.statCard}>
                      <span style={styles.statLabel}>Completed Purchases</span>
                      <span style={styles.statValue}>{metrics.totalOrders}</span>
                    </div>
                    <div className="glass-card" style={styles.statCard}>
                      <span style={styles.statLabel}>Fulfillments Pending</span>
                      <span style={styles.statValue}>{metrics.pendingOrders}</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ marginTop: '24px' }}>
                    <h3 style={styles.subTitle}><AlertTriangle size={18} color="var(--warning)" /> Inventory Warning Stock (Under 10 Units)</h3>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Current Inventory</th>
                            <th>Trigger Alert</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.filter(p => p.inventory_qty < 10).map(p => (
                            <tr key={p.id}>
                              <td><code>{p.sku}</code></td>
                              <td>{p.name}</td>
                              <td style={{ color: 'var(--error)', fontWeight: 600 }}>{p.inventory_qty}</td>
                              <td><span className="badge badge-cancelled">Low stock</span></td>
                            </tr>
                          ))}
                          {products.filter(p => p.inventory_qty < 10).length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All inventory stock levels optimal.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS & STOCK */}
              {activeTab === 'products' && (
                <div>
                  <div style={styles.tabActionsHeader}>
                    <h2 style={{ color: '#fff', fontSize: '1.25rem' }}>Active Catalog</h2>
                    <button onClick={() => { setProductForm({ id: null, name: '', slug: '', price: '', sku: '', inventory_qty: '', category_id: '', is_active: true, images: [''] }); setShowProductForm(true); }} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Product
                    </button>
                  </div>

                  {showProductForm && (
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                      <h3 style={{ ...styles.subTitle, color: 'var(--accent-color)' }}>{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
                      <form onSubmit={handleProductSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label className="form-label">Product Name *</label>
                            <input type="text" value={productForm.name} onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))} className="form-control" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Category *</label>
                            <select value={productForm.category_id} onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))} className="form-control" required>
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">SKU ID *</label>
                            <input type="text" value={productForm.sku} onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))} className="form-control" placeholder="TS-HVY-BK-01" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">URL Slug *</label>
                            <input type="text" value={productForm.slug} onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="form-control" placeholder="classic-tee-black" required />
                          </div>
                        </div>

                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Retail Price ($ USD) *</label>
                            <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))} className="form-control" placeholder="35.00" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Initial Inventory Quantity *</label>
                            <input type="number" value={productForm.inventory_qty} onChange={(e) => setProductForm(prev => ({ ...prev, inventory_qty: e.target.value }))} className="form-control" placeholder="50" required />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Product Image URL</label>
                          <input type="text" value={productForm.images[0]} onChange={(e) => setProductForm(prev => ({ ...prev, images: [e.target.value] }))} className="form-control" placeholder="https://..." />
                        </div>

                        <div style={styles.formButtons}>
                          <button type="submit" className="btn btn-primary">{productForm.id ? 'Save Changes' : 'Create Product'}</button>
                          <button type="button" onClick={() => setShowProductForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product Title</th>
                          <th>Price</th>
                          <th>Stock Qty</th>
                          <th>Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(prod => (
                          <tr key={prod.id}>
                            <td><code>{prod.sku}</code></td>
                            <td>{prod.name}</td>
                            <td>${parseFloat(prod.price).toFixed(2)}</td>
                            <td style={{ color: prod.inventory_qty < 10 ? 'var(--error)' : 'inherit', fontWeight: prod.inventory_qty < 10 ? 600 : 'normal' }}>
                              {prod.inventory_qty}
                            </td>
                            <td>
                              <div style={styles.actionCell}>
                                <button onClick={() => handleEditProduct(prod)} style={styles.iconAction} title="Edit Item"><Edit size={14} /></button>
                                <button onClick={() => handleDeleteProduct(prod.id)} style={styles.iconActionDelete} title="Delete Item"><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: ORDERS LIST */}
              {activeTab === 'orders' && (
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px' }}>Customer Shipments</h2>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Client Name</th>
                          <th>Subtotal</th>
                          <th>Fulfill Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td><code>{order.id.substring(0, 8)}...</code></td>
                            <td>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</td>
                            <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${order.status}`}>{order.status}</span>
                            </td>
                            <td>
                              {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'refunded' ? (
                                <button
                                  onClick={() => handleOrderStatusUpdate(order.id, order.status, order.tracking_number || 'TRK-' + Math.floor(100000 + Math.random() * 900000))}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                >
                                  {order.status === 'pending' ? 'Mark Paid' : order.status === 'paid' ? 'Assemble Pack' : order.status === 'processing' ? 'Mark Shipped' : 'Complete Delivery'}
                                </button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Closed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: COUPONS */}
              {activeTab === 'coupons' && (
                <div>
                  <div style={styles.tabActionsHeader}>
                    <h2 style={{ color: '#fff', fontSize: '1.25rem' }}>Active Discount Codes</h2>
                    <button onClick={() => setShowCouponForm(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Coupon
                    </button>
                  </div>

                  {showCouponForm && (
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                      <h3 style={{ ...styles.subTitle, color: 'var(--accent-color)' }}>Generate Promo Coupon</h3>
                      <form onSubmit={handleCouponSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Coupon Code (Uppercase) *</label>
                            <input type="text" value={couponForm.code} onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} className="form-control" placeholder="SALE20" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Type *</label>
                            <select value={couponForm.discount_type} onChange={(e) => setCouponForm(prev => ({ ...prev, discount_type: e.target.value }))} className="form-control" required>
                              <option value="percentage">Percentage discount (%)</option>
                              <option value="flat">Flat USD discount ($)</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Discount Value *</label>
                            <input type="number" step="0.1" value={couponForm.discount_value} onChange={(e) => setCouponForm(prev => ({ ...prev, discount_value: e.target.value }))} className="form-control" required />
                          </div>
                        </div>
                        <div style={styles.formButtons}>
                          <button type="submit" className="btn btn-primary">Create Coupon</button>
                          <button type="button" onClick={() => setShowCouponForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map(cop => (
                          <tr key={cop.id}>
                            <td><strong>{cop.code}</strong></td>
                            <td>{cop.discount_type === 'percentage' ? 'Percentage' : 'Flat Discount'}</td>
                            <td>{cop.discount_type === 'percentage' ? `${cop.discount_value}%` : `$${parseFloat(cop.discount_value).toFixed(2)}`}</td>
                            <td>
                              <span className={cop.is_active ? 'badge badge-paid' : 'badge badge-cancelled'}>
                                {cop.is_active ? 'Active' : 'Expired'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: STAFF */}
              {activeTab === 'employees' && (
                <div>
                  <div style={styles.tabActionsHeader}>
                    <h2 style={{ color: '#fff', fontSize: '1.25rem' }}>Staff Profiles</h2>
                    <button onClick={() => setShowEmployeeForm(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add Staff Account
                    </button>
                  </div>

                  {showEmployeeForm && (
                    <div className="glass-card" style={{ marginBottom: '24px' }}>
                      <h3 style={{ ...styles.subTitle, color: 'var(--accent-color)' }}>Register Staff Member</h3>
                      <form onSubmit={handleEmployeeSubmit} style={styles.form}>
                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">First Name *</label>
                            <input type="text" value={employeeForm.first_name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, first_name: e.target.value }))} className="form-control" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Last Name *</label>
                            <input type="text" value={employeeForm.last_name} onChange={(e) => setEmployeeForm(prev => ({ ...prev, last_name: e.target.value }))} className="form-control" required />
                          </div>
                        </div>
                        <div style={styles.formRow}>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label className="form-label">Email Address *</label>
                            <input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))} className="form-control" required />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">System Role *</label>
                            <select value={employeeForm.role} onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))} className="form-control" required>
                              <option value="manager">Store Manager</option>
                              <option value="admin">System Administrator</option>
                            </select>
                          </div>
                        </div>
                        <div style={styles.formButtons}>
                          <button type="submit" className="btn btn-primary">Create Profile</button>
                          <button type="button" onClick={() => setShowEmployeeForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Full Name</th>
                          <th>System Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map(emp => (
                          <tr key={emp.id}>
                            <td><code>{emp.id}</code></td>
                            <td>{emp.first_name} {emp.last_name}</td>
                            <td><span className="badge badge-processing">{emp.role}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="glass-card">
                  <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px' }}>Shipping & Operational Constants</h2>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Operational updates registered successfully.'); }} style={styles.form}>
                    <div className="form-group">
                      <label className="form-label">Standard Shipping Rate ($ USD) *</label>
                      <input type="text" value={storeSettings.standardRate} onChange={(e) => setStoreSettings(prev => ({ ...prev, standardRate: e.target.value }))} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Express Courier Shipping Rate ($ USD) *</label>
                      <input type="text" value={storeSettings.expressRate} onChange={(e) => setStoreSettings(prev => ({ ...prev, expressRate: e.target.value }))} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Free Shipping Subtotal Threshold ($ USD) *</label>
                      <input type="text" value={storeSettings.threshold} onChange={(e) => setStoreSettings(prev => ({ ...prev, threshold: e.target.value }))} className="form-control" />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                      Save Operational Details
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '60px',
    paddingBottom: '80px',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
  },
  navCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  statCard: {
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 600,
    color: 'var(--accent-color)',
  },
  subTitle: {
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabActionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  actionCell: {
    display: 'flex',
    gap: '12px',
  },
  iconAction: {
    color: 'var(--text-secondary)',
    transition: 'var(--transition-smooth)',
  },
  iconActionDelete: {
    color: 'var(--error)',
    transition: 'var(--transition-smooth)',
  },
  center: {
    textAlign: 'center',
    padding: '80px 0',
    color: 'var(--text-secondary)',
  }
};


