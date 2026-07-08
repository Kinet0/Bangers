import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext.jsx';
import { Package, User, MapPin, Eye, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, token, getAuthHeaders, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Protect Route
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  // Load orders and profile details
  useEffect(() => {
    if (!token) return;

    async function loadDashboardData() {
      try {
        // Fetch past orders
        const ordRes = await fetch(`${API_URL}/api/orders`, {
          headers: getAuthHeaders()
        });
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders(ordData);
        }

        // Fetch complete profile details (prefill form)
        const profRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: getAuthHeaders()
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          const p = profData.user;
          // Fetch profile details matching mock layout
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({}) // triggers return of active profile
          });
          if (res.ok) {
            const data = await res.json();
            const pf = data.profile;
            setProfileForm({
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              phone: pf.phone || '',
              address1: pf.address_line1 || '',
              address2: pf.address_line2 || '',
              city: pf.city || '',
              state: pf.state || '',
              zip: pf.postal_code || '',
              country: pf.country || 'US'
            });
          }
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    loadDashboardData();
  }, [token]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    try {
      await updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
        address_line1: profileForm.address1,
        address_line2: profileForm.address2,
        city: profileForm.city,
        state: profileForm.state,
        postal_code: profileForm.zip,
        country: profileForm.country
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || 'Failed to update profile coordinates');
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to request cancellation for this order?')) return;
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title">My Account</h1>

      <div style={styles.layout}>
        {/* Navigation Tabs */}
        <aside style={styles.tabsCol}>
          <div className="glass-card" style={styles.tabsCard}>
            <button
              onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
              style={{ ...styles.tabBtn, color: activeTab === 'orders' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >
              <Package size={18} /> Purchase History
            </button>
            <button
              onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
              style={{ ...styles.tabBtn, color: activeTab === 'profile' ? 'var(--accent-color)' : 'var(--text-secondary)' }}
            >
              <User size={18} /> Shipping Profile
            </button>
          </div>
        </aside>

        {/* Dynamic Display Area */}
        <main style={styles.contentCol}>
          {activeTab === 'orders' && (
            <div>
              {selectedOrder ? (
                /* Order detailed view */
                <div className="glass-card">
                  <div style={styles.detailHeader}>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.25rem' }}>Receipt Details</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Order ID: {selectedOrder.id}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Back to list
                    </button>
                  </div>

                  <div style={styles.detailMetaGrid}>
                    <div>
                      <h4 style={styles.metaTitle}>Fulfillment Address</h4>
                      <p style={styles.metaText}>
                        {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}<br />
                        {selectedOrder.shipping_address.address1}<br />
                        {selectedOrder.shipping_address.address2 && <>{selectedOrder.shipping_address.address2}<br /></>}
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}<br />
                        Phone: {selectedOrder.shipping_address.phone}
                      </p>
                    </div>
                    <div>
                      <h4 style={styles.metaTitle}>Tracking Information</h4>
                      <p style={styles.metaText}>
                        Method: {selectedOrder.shipping_method === 'express' ? 'Express Courier' : 'Standard Delivery'}<br />
                        Tracking Code: <span style={{ color: selectedOrder.tracking_number ? 'var(--accent-color)' : 'inherit' }}>{selectedOrder.tracking_number || 'Awaiting dispatch'}</span>
                      </p>
                    </div>
                    <div>
                      <h4 style={styles.metaTitle}>Financial Summary</h4>
                      <p style={styles.metaText}>
                        Subtotal: ${(selectedOrder.total_amount - 5 + parseFloat(selectedOrder.discount_amount)).toFixed(2)}<br />
                        Discount: -${parseFloat(selectedOrder.discount_amount).toFixed(2)}<br />
                        <strong>Final Amount: ${parseFloat(selectedOrder.total_amount).toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>

                  <h4 style={{ ...styles.metaTitle, marginTop: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Purchased Items</h4>
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} style={styles.detailItemRow}>
                      <img src={item.products?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.products?.name} style={styles.detailItemImg} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>{item.products?.name}</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>SKU: {item.products?.sku}</p>
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.quantity} x ${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))}

                  {/* Actions (cancellation) */}
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'paid') && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px', textAlign: 'right' }}>
                      <button onClick={() => handleCancelOrder(selectedOrder.id)} className="btn btn-danger" style={{ padding: '10px 20px' }}>
                        Request Order Cancellation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Orders grid list */
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px', fontWeight: 500 }}>Fulfillment History</h2>
                  {loadingOrders ? (
                    <div style={styles.center}>Aggregating past shipments...</div>
                  ) : orders.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
                      <p style={{ color: 'var(--text-secondary)' }}>You haven't made any purchases yet.</p>
                    </div>
                  ) : (
                    <div style={styles.orderList}>
                      {orders.map(order => (
                        <div className="glass-card" key={order.id} style={styles.orderCard}>
                          <div style={styles.orderRowHeader}>
                            <div>
                              <span style={styles.orderIdLabel}>Order ID</span>
                              <span style={styles.orderIdValue}>{order.id.substring(0, 18)}...</span>
                            </div>
                            <span className={`badge badge-${order.status}`}>{order.status}</span>
                          </div>
                          
                          <div style={styles.orderRowMeta}>
                            <div>
                              <span style={styles.metaLabel}>Date Placed</span>
                              <span style={styles.metaValue}>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span style={styles.metaLabel}>Total Paid</span>
                              <span style={styles.metaValue}>${parseFloat(order.total_amount).toFixed(2)}</span>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                              <button onClick={() => viewOrderDetails(order.id)} className="btn btn-secondary" style={styles.viewBtn}>
                                <Eye size={14} /> Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="glass-card">
              <h2 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px', fontWeight: 500 }}>Fulfillment Information</h2>
              <form onSubmit={handleProfileSave} style={styles.form}>
                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} className="form-control" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} className="form-control" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Contact Number</label>
                  <input type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="form-control" placeholder="555-0100" />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line 1</label>
                  <input type="text" name="address1" value={profileForm.address1} onChange={handleProfileChange} className="form-control" placeholder="123 Main St" />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input type="text" name="address2" value={profileForm.address2} onChange={handleProfileChange} className="form-control" placeholder="Apt 4B" />
                </div>

                <div style={styles.formRow}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">City</label>
                    <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">State</label>
                    <input type="text" name="state" value={profileForm.state} onChange={handleProfileChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">ZIP / Postal Code</label>
                    <input type="text" name="zip" value={profileForm.zip} onChange={handleProfileChange} className="form-control" />
                  </div>
                </div>

                {saveSuccess && <p style={styles.successText}>Profile coordinates updated successfully.</p>}
                {saveError && <p style={styles.errorText}>{saveError}</p>}

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Update Address Profile
                </button>
              </form>
            </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '40px',
    marginTop: '32px',
  },
  tabsCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  tabsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: 500,
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    backgroundColor: 'transparent',
  },
  contentCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  orderCard: {
    backgroundColor: 'var(--bg-secondary)',
  },
  orderRowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  orderIdLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  orderIdValue: {
    fontSize: '0.9rem',
    color: '#fff',
    fontWeight: 500,
  },
  orderRowMeta: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  metaLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metaValue: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  viewBtn: {
    padding: '8px 14px',
    fontSize: '0.8rem',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  detailMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    backgroundColor: 'var(--bg-primary)',
    padding: '20px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  metaTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#fff',
    marginBottom: '8px',
    fontWeight: 600,
  },
  metaText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  detailItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  detailItemImg: {
    width: '45px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  successText: {
    color: 'var(--success)',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  center: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
  }
};
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
