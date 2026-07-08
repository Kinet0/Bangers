import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    coupon,
    couponError,
    shippingMethod,
    setShippingMethod,
    cartSubtotal,
    discountAmount,
    shippingCost,
    cartTotal
  } = useCart();

  const { token } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (promoCode.trim()) {
      const ok = await applyCoupon(promoCode);
      if (ok) setPromoCode('');
    }
  };

  const handleCheckout = () => {
    if (!token) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={styles.centerContainer}>
        <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
        <h2>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Explore our collections and add items to your cart.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title">Your Cart</h1>

      <div style={styles.layout}>
        {/* Cart items list */}
        <div style={styles.itemsSection}>
          <div className="glass-card" style={{ padding: '0 24px' }}>
            {cartItems.map((item, idx) => (
              <div key={item.product_id} style={{ ...styles.itemRow, borderBottom: idx === cartItems.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                <img src={item.image} alt={item.name} style={styles.itemImg} />
                
                <div style={styles.itemDetails}>
                  <Link to={`/products/${item.slug}`} style={styles.itemName}>
                    {item.name}
                  </Link>
                  <span style={styles.itemPrice}>${item.price.toFixed(2)}</span>
                </div>

                <div style={styles.quantityCol}>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyText}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                </div>

                <div style={styles.totalCol}>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>

                <button onClick={() => removeFromCart(item.product_id)} style={styles.deleteBtn} title="Remove Item">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={styles.actionRow}>
            <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
            <button onClick={clearCart} className="btn btn-danger">Clear Cart</button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside style={styles.summarySection}>
          <div className="glass-card" style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>

            {/* Price lines */}
            <div style={styles.summaryLine}>
              <span>Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>

            {coupon && (
              <div style={{ ...styles.summaryLine, color: 'var(--success)' }}>
                <span style={styles.couponTagLabel}>
                  Discount ({coupon.code}) 
                  <button onClick={removeCoupon} style={styles.removeCouponBtn}><X size={12} /></button>
                </span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Shipping selection */}
            <div style={styles.shippingBox}>
              <span style={styles.shippingLabel}>Shipping Method</span>
              <div style={styles.shippingRadioRow}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    style={styles.radioInput}
                  />
                  <span>Standard Delivery (${shippingCost === 0 && shippingMethod === 'standard' ? 'Free' : '$5.00'})</span>
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    style={styles.radioInput}
                  />
                  <span>Express Delivery ($15.00)</span>
                </label>
              </div>
            </div>

            <div style={styles.summaryLine}>
              <span>Shipping Fee</span>
              <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>

            <div style={{ ...styles.summaryLine, borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontWeight: 600, fontSize: '1.15rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-color)' }}>${cartTotal.toFixed(2)}</span>
            </div>

            {/* Coupon Promo Form */}
            <form onSubmit={handleApplyCoupon} style={styles.couponForm}>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={styles.couponInput}
              />
              <button type="submit" className="btn btn-secondary" style={styles.couponBtn}>
                Apply
              </button>
            </form>
            {couponError && <p style={styles.errorMsg}>{couponError}</p>}
            {coupon && <p style={styles.successMsg}>Discount applied successfully!</p>}

            <button onClick={handleCheckout} className="btn btn-primary" style={styles.checkoutBtn}>
              Checkout Securely <ArrowRight size={16} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '60px',
    paddingBottom: '80px',
  },
  centerContainer: {
    padding: '120px 0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px 0',
  },
  itemImg: {
    width: '70px',
    height: '93px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    marginRight: '20px',
  },
  itemDetails: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemName: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
  },
  itemPrice: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  quantityCol: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    marginRight: '32px',
  },
  qtyBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: '24px',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  totalCol: {
    width: '80px',
    fontWeight: 500,
    color: '#fff',
    marginRight: '20px',
    textAlign: 'right',
  },
  deleteBtn: {
    color: 'var(--text-muted)',
    transition: 'var(--transition-smooth)',
    padding: '6px',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  summarySection: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryCard: {
    position: 'sticky',
    top: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryTitle: {
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    color: '#fff',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  summaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
  },
  couponTagLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  removeCouponBtn: {
    color: 'var(--error)',
    padding: '2px',
    display: 'flex',
  },
  shippingBox: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  shippingLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  shippingRadioRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  radioInput: {
    accentColor: 'var(--accent-color)',
  },
  couponForm: {
    display: 'flex',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    marginTop: '8px',
  },
  couponInput: {
    flexGrow: 1,
    padding: '10px 14px',
    fontSize: '0.85rem',
    backgroundColor: 'var(--bg-primary)',
    outline: 'none',
  },
  couponBtn: {
    padding: '0 16px',
    borderLeft: '1px solid var(--border-color)',
    borderRadius: 0,
    fontSize: '0.8rem',
  },
  errorMsg: {
    fontSize: '0.8rem',
    color: 'var(--error)',
  },
  successMsg: {
    fontSize: '0.8rem',
    color: 'var(--success)',
  },
  checkoutBtn: {
    width: '100%',
    padding: '14px 0',
    marginTop: '10px',
  }
};

