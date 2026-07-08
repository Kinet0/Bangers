import React from 'react';

export default function About() {
  return (
    <div className="container" style={styles.container}>
      <div style={styles.header}>
        <span style={styles.subtitle}>Our Philosophy</span>
        <h1 style={styles.title}>ESSENTIAL DESIGN.<br />MADE TO LAST.</h1>
      </div>

      <div className="about-layout" style={{ marginBottom: '80px' }}>
        <div className="glass-card" style={styles.card}>
          <h2 style={styles.cardTitle}>Mindful Craftsmanship</h2>
          <p style={styles.text}>
            Aura Wear was born out of a simple need: premium, clean, everyday clothing basics that do not wear out after three washes. We reject the fast-fashion cycle of planned obsolescence and excessive consumption. 
          </p>
          <p style={styles.text}>
            Instead, we focus on heavyweight organic cottons, French terry weaves, and meticulous stitching. Our designs are intentionally minimalist, allowing they blend seamlessly into any wardrobe.
          </p>
        </div>

        <div style={styles.imgCol}>
          <img 
            src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800" 
            alt="Organic textiles" 
            style={styles.img} 
          />
        </div>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>100%</span>
          <span style={styles.metricLabel}>Certified Organic Cotton</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>300+</span>
          <span style={styles.metricLabel}>Grams Per Square Meter (GSM)</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>Zero</span>
          <span style={styles.metricLabel}>Harmful Chemical Dyes Used</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '80px',
    paddingBottom: '100px',
  },
  header: {
    maxWidth: '600px',
    marginBottom: '60px',
  },
  subtitle: {
    color: 'var(--accent-color)',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    display: 'block',
    marginBottom: '16px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    color: '#fff',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    fontWeight: 500,
  },
  text: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  imgCol: {
    aspectRatio: '1/1',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '60px',
    textAlign: 'center',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: 'var(--accent-color)',
  },
  metricLabel: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
  }
};

