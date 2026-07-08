import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title" style={styles.title}>Contact Us</h1>

      <div className="contact-layout">
        {/* Contact Form */}
        <div className="glass-card" style={styles.card}>
          <h3 style={styles.cardTitle}>Send a Message</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control" required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="form-control" />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} className="form-control" rows="5" required style={{ resize: 'vertical' }}></textarea>
            </div>

            {submitted && <p style={styles.successMsg}>Thank you. Your message has been sent!</p>}

            <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
              {submitted ? <><Check size={16} /> Sent</> : <><Send size={16} /> Send Inquiry</>}
            </button>
          </form>
        </div>

        {/* Office details */}
        <div style={styles.detailsCol}>
          <div className="glass-card" style={styles.detailCard}>
            <h3 style={styles.cardTitle}>Customer Support</h3>
            <div style={styles.infoRow}>
              <Mail size={18} color="var(--accent-color)" />
              <div>
                <span style={styles.infoLabel}>Email</span>
                <a href="mailto:support@aurawear.com" style={styles.infoValue}>support@aurawear.com</a>
              </div>
            </div>
            <div style={styles.infoRow}>
              <Phone size={18} color="var(--accent-color)" />
              <div>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>+1 (800) 555-0199</span>
              </div>
            </div>
            <div style={styles.infoRow}>
              <Clock size={18} color="var(--accent-color)" />
              <div>
                <span style={styles.infoLabel}>Operating Hours</span>
                <span style={styles.infoValue}>Mon - Fri: 9AM - 5PM EST</span>
              </div>
            </div>
            <div style={styles.infoRow}>
              <MapPin size={18} color="var(--accent-color)" />
              <div>
                <span style={styles.infoLabel}>Headquarters</span>
                <span style={styles.infoValue}>123 Fashion Blvd, Los Angeles, CA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '60px',
    paddingBottom: '80px',
  },
  title: {
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'var(--bg-secondary)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  submitBtn: {
    alignSelf: 'flex-start',
    padding: '12px 24px',
  },
  successMsg: {
    color: 'var(--success)',
    fontSize: '0.9rem',
    marginBottom: '16px',
  },
  detailsCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailCard: {
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  infoLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
  },
  infoValue: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  }
};

