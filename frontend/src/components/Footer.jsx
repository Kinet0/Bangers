import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Check } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.gridContainer}>
        <div style={styles.brandCol}>
          <Link to="/" style={styles.logo}>
            AURA <span style={styles.logoAccent}>WEAR</span>
          </Link>
          <p style={styles.desc}>
            Premium everyday clothing basics. Designed for longevity, comfort, and sustainable modern style.
          </p>
        </div>

        <div style={styles.linkCol}>
          <h4 style={styles.colTitle}>Collections</h4>
          <Link to="/shop?category=t-shirts" style={styles.link}>T-Shirts</Link>
          <Link to="/shop?category=hoodies" style={styles.link}>Hoodies</Link>
          <Link to="/shop?category=shirts" style={styles.link}>Linen Shirts</Link>
          <Link to="/shop?category=pants" style={styles.link}>Trousers</Link>
        </div>

        <div style={styles.linkCol}>
          <h4 style={styles.colTitle}>Support</h4>
          <Link to="/faq" style={styles.link}>FAQs</Link>
          <Link to="/contact" style={styles.link}>Contact Us</Link>
          <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
          <Link to="/terms" style={styles.link}>Terms & Conditions</Link>
        </div>

        <div style={styles.newsletterCol}>
          <h4 style={styles.colTitle}>Newsletter</h4>
          <p style={styles.newsletterDesc}>Sign up for early catalog access, product drops, and exclusive offers.</p>
          <form onSubmit={handleSubscribe} style={styles.form}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.submitBtn} title="Subscribe">
              {subscribed ? <Check size={18} color="var(--success)" /> : <Send size={18} />}
            </button>
          </form>
          {subscribed && <span style={styles.successMsg}>Thank you for subscribing!</span>}
        </div>
      </div>

      <div className="container" style={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Aura Wear Inc. All rights reserved.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
          Designed with premium aesthetics and high-performance vanilla CSS.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    padding: '80px 0 40px 0',
    marginTop: 'auto',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 2fr',
    gap: '40px',
    marginBottom: '60px',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#fff',
  },
  logoAccent: {
    color: 'var(--accent-color)',
    fontWeight: 300,
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    maxWidth: '280px',
  },
  linkCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  colTitle: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
  },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  newsletterCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  newsletterDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    maxWidth: '300px',
  },
  form: {
    display: 'flex',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-primary)',
    maxWidth: '300px',
  },
  input: {
    flexGrow: 1,
    padding: '10px 14px',
    fontSize: '0.85rem',
    outline: 'none',
  },
  submitBtn: {
    padding: '0 16px',
    borderLeft: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  successMsg: {
    fontSize: '0.8rem',
    color: 'var(--success)',
  },
  copyright: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '30px',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  }
};
