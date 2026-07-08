import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title">Privacy Policy</h1>
      <div className="glass-card" style={styles.card}>
        <p style={styles.date}>Effective Date: July 8, 2026</p>
        
        <h3 style={styles.subTitle}>1. Information We Collect</h3>
        <p style={styles.text}>
          We collect personal identification details (name, shipping address, email, phone number) when you register an account or complete a purchase checkout flow. All billing and card transaction information is dispatched directly to Stripe. We do not store credit card numbers on our server infrastructure.
        </p>

        <h3 style={styles.subTitle}>2. How We Use Information</h3>
        <p style={styles.text}>
          We utilize customer coordinates to process orders, manage accounts, trigger shipping notifications, and communicate transactional billing records. If opted-in, we will dispatch drop notifications or newsletter materials to your email.
        </p>

        <h3 style={styles.subTitle}>3. Cookies and Analytics</h3>
        <p style={styles.text}>
          We use functional cookies to preserve shopping cart contents across sessions and session state login tokens. Anonymous analytics data might be aggregated to optimize catalog navigability.
        </p>
      </div>
    </div>
  );
}

export function TermsConditions() {
  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title">Terms & Conditions</h1>
      <div className="glass-card" style={styles.card}>
        <p style={styles.date}>Effective Date: July 8, 2026</p>

        <h3 style={styles.subTitle}>1. Store Operations</h3>
        <p style={styles.text}>
          By placing an order on Aura Wear, you agree that you are purchase-authorized under the credit card details supplied. All product details, dimensions, and descriptions are subject to stock availability adjustments.
        </p>

        <h3 style={styles.subTitle}>2. Payment and Billing</h3>
        <p style={styles.text}>
          Payments are handled securely via the Stripe transaction processing system. In case of payment failure or declined cards, orders will remain pending until completed. We reserve the right to cancel orders listing pricing errors.
        </p>

        <h3 style={styles.subTitle}>3. Shipping and Delivery</h3>
        <p style={styles.text}>
          Standard and Express courier schedules are estimates. We are not liable for freight delays caused by customs checkpoints or regional weather disruptions. Once marked delivered by the courier tracking logs, responsibility passes to the buyer.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '60px',
    paddingBottom: '80px',
    maxWidth: '800px',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  date: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  subTitle: {
    color: '#fff',
    fontSize: '1.15rem',
    fontWeight: 500,
  },
  text: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  }
};
