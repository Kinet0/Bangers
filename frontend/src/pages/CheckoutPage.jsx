import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth, API_URL } from '../context/AuthContext.jsx';

export default function CheckoutPage() {
  const { cartItems, cartSubtotal, discountAmount, shippingCost, cartTotal, coupon, shippingMethod, clearCart } = useCart();
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  // Billing/Simulated Card State
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Initialize Payment Intent on component mount
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    async function initCheckout() {
      try {
        const res = await fetch(`${API_URL}/api/checkout/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
            couponCode: coupon?.code || null,
            shippingMethod
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to initialize payment process');
        setPaymentData(data);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Error configuring payment gate');
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [cartItems, coupon, shippingMethod]);

  const handleInputChange = (e) => {
    setShippingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCardChange = (e) => {
    setCardForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setProcessing(true);

    const { firstName, lastName, address1, city, state, zip, phone } = shippingForm;
    if (!firstName || !lastName || !address1 || !city || !state || !zip || !phone) {
      setErrorMsg('Please complete all mandatory shipping details.');
      setProcessing(false);
      return;
    }

    if (paymentData.isMock) {
      const { number, expiry, cvv } = cardForm;
      if (!number || !expiry || !cvv) {
        setErrorMsg('Please fill in card detail fields (Simulation Mode).');
        setProcessing(false);
        return;
      }
    }

    try {
      // 1. Submit order details to backend API (marked pending if Stripe intent exists)
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
          total_amount: cartTotal,
          discount_amount: discountAmount,
          shipping_address: shippingForm,
          shipping_method: shippingMethod,
          stripe_intent_id: paymentData.stripeIntentId
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to file purchase order');

      // 2. Perform payment transaction simulation/processing
      if (paymentData.isMock) {
        // Simulate background Stripe transaction webhook call
        console.log('Simulating Stripe webhook payment confirmation call...');
        await fetch(`${API_URL}/api/checkout/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: paymentData.stripeIntentId
              }
            }
          })
        });

        // Clear local state cart
        clearCart();
        setSuccessOrder(orderData.order);
      } else {
        // In actual Stripe scenario, you would trigger stripe.confirmCardPayment()
        // Here we simulate successful resolution for development purposes
        clearCart();
        setSuccessOrder(orderData.order);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Payment operation failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (successOrder) {
    return (
      <div className="container" style={styles.successContainer}>
        <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '24px' }} />
        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '8px' }}>Payment Approved!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '24px' }}>
          Thank you for choosing Aura Wear. Your order has been registered under:
        </p>
        <div className="glass-card" style={styles.receiptCard}>
          <p style={styles.receiptLine}><strong>Order ID:</strong> <span style={{ color: 'var(--accent-color)' }}>{successOrder.id}</span></p>
          <p style={styles.receiptLine}><strong>Shipping Carrier:</strong> {shippingMethod === 'express' ? 'Express Courier' : 'Standard Delivery'}</p>
          <p style={styles.receiptLine}><strong>Total Bill:</strong> ${parseFloat(successOrder.total_amount).toFixed(2)}</p>
          <p style={styles.receiptLine}><strong>Status:</strong> <span className="badge badge-paid">Paid</span></p>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '24px', maxWidth: '400px' }}>
          A secure verification transaction receipt has been dispatched. You can track fulfillment status inside your dashboard.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '32px' }}>
          View Customer Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title">Checkout</h1>
      
      {loading ? (
        <div style={styles.center}>Configuring secure gateway components...</div>
      ) : (
        <form onSubmit={handlePlaceOrder} style={styles.layout}>
          {/* Inputs Section */}
          <div style={styles.leftCol}>
            {/* Shipping details */}
            <div className="glass-card" style={styles.cardGroup}>
              <h3 style={styles.cardTitle}>Shipping Coordinates</h3>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">First Name *</label>
                  <input type="text" name="firstName" value={shippingForm.firstName} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Last Name *</label>
                  <input type="text" name="lastName" value={shippingForm.lastName} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address Line 1 *</label>
                <input type="text" name="address1" value={shippingForm.address1} onChange={handleInputChange} className="form-control" placeholder="Street Address, P.O. Box" required />
              </div>
              <div className="form-group">
                <label className="form-label">Address Line 2 (Optional)</label>
                <input type="text" name="address2" value={shippingForm.address2} onChange={handleInputChange} className="form-control" placeholder="Apartment, suite, unit, building" />
              </div>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">City *</label>
                  <input type="text" name="city" value={shippingForm.city} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">State *</label>
                  <input type="text" name="state" value={shippingForm.state} onChange={handleInputChange} className="form-control" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">ZIP / Postal *</label>
                  <input type="text" name="zip" value={shippingForm.zip} onChange={handleInputChange} className="form-control" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Contact Number *</label>
                <input type="text" name="phone" value={shippingForm.phone} onChange={handleInputChange} className="form-control" required />
              </div>
            </div>

            {/* Payment Details */}
            <div className="glass-card" style={styles.cardGroup}>
              <div style={styles.paymentHeader}>
                <h3 style={styles.cardTitle}><CreditCard size={18} /> Payment Information</h3>
                {paymentData?.isMock && <span style={styles.simulationBadge}>Simulation Mode</span>}
              </div>
              
              {paymentData?.isMock ? (
                <div>
                  <p style={styles.simText}>Please complete mock credentials for local transaction routing:</p>
                  <div className="form-group">
                    <label className="form-label">Simulated Card Number *</label>
                    <input
                      type="text"
                      name="number"
                      value={cardForm.number}
                      onChange={handleCardChange}
                      className="form-control"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Expiry Date *</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardForm.expiry}
                        onChange={handleCardChange}
                        className="form-control"
                        placeholder="MM / YY"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Security CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardForm.cvv}
                        onChange={handleCardChange}
                        className="form-control"
                        placeholder="321"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.stripePlaceholder}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Stripe Elements card entry active.</p>
                  <div style={styles.cardStubInput}>Stripe Card Element Component Loaded</div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Totals Sidebar */}
          <aside style={styles.rightCol}>
            <div className="glass-card" style={styles.summarySticky}>
              <h3 style={styles.cardTitle}>Bill Summary</h3>
              {cartItems.map(item => (
                <div key={item.product_id} style={styles.summaryItem}>
                  <span style={styles.itemTitle}>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div style={styles.lineDivider}></div>

              <div style={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ ...styles.summaryLine, color: 'var(--success)' }}>
                  <span>Promo discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={styles.summaryLine}>
                <span>Shipping fee</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>

              <div style={{ ...styles.summaryLine, fontWeight: 600, color: '#fff', fontSize: '1.1rem', marginTop: '10px' }}>
                <span>Final Total</span>
                <span style={{ color: 'var(--accent-color)' }}>${cartTotal.toFixed(2)}</span>
              </div>

              {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}

              <button
                type="submit"
                disabled={processing}
                className="btn btn-primary"
                style={styles.payBtn}
              >
                {processing ? 'Processing payment...' : <>Place Secure Order <Lock size={14} /></>}
              </button>
            </div>
          </aside>
        </form>
      )}
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
    gridTemplateColumns: '1fr 380px',
    gap: '40px',
    marginTop: '32px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  cardGroup: {
    backgroundColor: 'var(--bg-secondary)',
  },
  cardTitle: {
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  simulationBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    color: 'var(--accent-color)',
    padding: '4px 8px',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  simText: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    marginBottom: '20px',
  },
  stripePlaceholder: {
    border: '1px dashed var(--border-color)',
    padding: '24px',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
  },
  cardStubInput: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  summarySticky: {
    position: 'sticky',
    top: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  itemTitle: {
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  lineDivider: {
    borderTop: '1px solid var(--border-color)',
    margin: '4px 0',
  },
  summaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
  payBtn: {
    width: '100%',
    padding: '14px 0',
    marginTop: '12px',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '0.85rem',
    marginTop: '8px',
  },
  successContainer: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  receiptCard: {
    width: '100%',
    maxWidth: '450px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  receiptLine: {
    fontSize: '0.95rem',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '8px',
  },
  center: {
    textAlign: 'center',
    padding: '100px 0',
    color: 'var(--text-secondary)',
  }
};
