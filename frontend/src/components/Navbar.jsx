import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ShoppingBag, User, Settings, LogOut, LogIn, Compass, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isManager } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header style={styles.header}>
      <div className="container" style={styles.navContainer}>
        <Link to="/" style={styles.logo}>
          AURA <span style={styles.logoAccent}>WEAR</span>
        </Link>

        <nav style={styles.nav}>
          <Link to="/shop" style={styles.navLink}>Shop</Link>
          <Link to="/about" style={styles.navLink}>About</Link>
          <Link to="/contact" style={styles.navLink}>Contact</Link>
          <Link to="/faq" style={styles.navLink}>FAQ</Link>
        </nav>

        <div style={styles.actions}>
          {isManager && (
            <Link to="/admin" title="Admin Portal" style={styles.iconLink}>
              <Settings size={20} color="var(--accent-color)" />
              <span style={styles.adminLabel}>Admin</span>
            </Link>
          )}

          <Link to="/cart" title="Shopping Cart" style={styles.cartIconWrapper}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>

          {user ? (
            <div style={styles.userMenu}>
              <Link to="/dashboard" title="Account Dashboard" style={styles.iconLink}>
                <User size={20} />
                <span style={styles.userLabel}>{user.firstName || 'Account'}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/login'); }} title="Sign Out" style={styles.logoutBtn}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" title="Login" style={styles.loginLink}>
              <LogIn size={20} />
              <span style={styles.loginText}>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '16px 0'
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#fff',
  },
  logoAccent: {
    color: 'var(--accent-color)',
    fontWeight: 300,
  },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    fontSize: '0.9rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    align-items: 'center',
    gap: '20px',
  },
  iconLink: {
    display: 'flex',
    align-items: 'center',
    gap: '6px',
    color: 'var(--text-primary)',
  },
  adminLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: 'var(--accent-color)',
  },
  cartIconWrapper: {
    position: 'relative',
    color: 'var(--text-primary)',
    display: 'flex',
    align-items: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    backgroundColor: 'var(--accent-color)',
    color: '#000',
    fontSize: '0.7rem',
    fontWeight: 700,
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    align-items: 'center',
    justify-content: 'center',
  },
  userMenu: {
    display: 'flex',
    align-items: 'center',
    gap: '12px',
  },
  userLabel: {
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  logoutBtn: {
    color: 'var(--text-muted)',
    display: 'flex',
    align-items: 'center',
    transition: 'var(--transition-smooth)',
  },
  loginLink: {
    display: 'flex',
    align-items: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
  },
  loginText: {
    fontSize: '0.85rem',
    fontWeight: 500,
  }
};
