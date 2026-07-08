import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'What materials are used in Aura Wear garments?',
      a: 'We use 100% certified organic cotton for all our heavyweight tees, hoodies, and sweatpants. Our linen line is spun from high-grade Belgian flax. We select materials that prioritize longevity, skin comfort, and biodegradable sustainability.'
    },
    {
      q: 'How does shipping calculation work?',
      a: 'We offer standard standard shipping for a flat rate of $5.00. However, if your subtotal exceeds $100.00 after discount codes are applied, standard shipping is automatically free. We also support express courier shipping for a flat rate of $15.00.'
    },
    {
      q: 'What is your returns and exchanges policy?',
      a: 'If you are unsatisfied with the fit, color, or shape, you can request an exchange or full refund within 30 days of receiving your package. Returns are free, and we will provide a pre-paid shipping label via email upon approval.'
    },
    {
      q: 'How should I wash and care for heavyweight cotton tees?',
      a: 'To maximize life and fit consistency, wash cold inside out with similar colors. Line dry is highly recommended, or tumble dry low. Do not bleach or iron high-contrast design prints directly.'
    },
    {
      q: 'How can I change or cancel my order?',
      a: 'You can request cancellation directly from your customer dashboard as long as the status is marked "Pending" or "Paid" (before our warehouse has packed and shipped the package). Once labeled "Shipped", you will have to request a return label after delivery.'
    }
  ];

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title" style={styles.title}>Frequently Asked Questions</h1>

      <div style={styles.list}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="glass-card" style={styles.faqItem} onClick={() => setOpenIdx(isOpen ? -1 : idx)}>
              <div style={styles.questionRow}>
                <h3 style={styles.question}>{faq.q}</h3>
                <span style={styles.toggleIcon}>
                  {isOpen ? <Minus size={18} color="var(--accent-color)" /> : <Plus size={18} />}
                </span>
              </div>
              
              <div style={{ ...styles.answerContainer, maxHeight: isOpen ? '200px' : '0', opacity: isOpen ? 1 : 0 }}>
                <p style={styles.answer}>{faq.a}</p>
              </div>
            </div>
          );
        })}
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
  title: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  faqItem: {
    backgroundColor: 'var(--bg-secondary)',
    cursor: 'pointer',
    padding: '24px',
    transition: 'var(--transition-smooth)',
  },
  questionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: '1.05rem',
    fontWeight: 500,
    color: '#fff',
    lineHeight: 1.4,
  },
  toggleIcon: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '16px',
  },
  answerContainer: {
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  answer: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    marginTop: '16px',
  }
};
