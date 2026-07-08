import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { API_URL } from '../context/AuthContext.jsx';

export default function Homepage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          // Take first 3 products as featured
          setFeatured(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading homepage products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div className="container" style={styles.heroContent}>
          <span style={styles.heroSubtitle}>Sustainable Craftsmanship</span>
          <h1 style={styles.heroTitle}>TIMELESS STYLE.<br />UNCOMPROMISING QUALITY.</h1>
          <p style={styles.heroText}>
            Everyday clothing basics engineered with heavy organic cottons, tailored fits, and minimalist color palettes.
          </p>
          <Link to="/shop" className="btn btn-primary" style={styles.heroBtn}>
            Shop the Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={styles.section}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Shop by Collection</h2>
          <div style={styles.categoryGrid}>
            {[
              { name: 'T-Shirts', slug: 't-shirts', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' },
              { name: 'Hoodies', slug: 'hoodies', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' },
              { name: 'Shirts', slug: 'shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500' },
              { name: 'Pants', slug: 'pants', img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500' }
            ].map(cat => (
              <Link to={`/shop?category=${cat.slug}`} key={cat.slug} style={styles.categoryCard}>
                <img src={cat.img} alt={cat.name} style={styles.categoryImg} />
                <div style={styles.categoryOverlay}></div>
                <h3 style={styles.categoryTitle}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Featured Products */}
      <section style={{ ...styles.section, backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={styles.featuredHeader}>
            <h2 className="section-title" style={{ margin: 0 }}>Trending Pieces</h2>
            <Link to="/shop" style={styles.viewAllLink}>
              View All Products <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={styles.center}>Loading trending collection...</div>
          ) : (
            <div className="grid grid-3">
              {featured.map(prod => (
                <Link to={`/products/${prod.slug}`} key={prod.id} className="glass-card" style={styles.productCard}>
                  <div style={styles.imgWrapper}>
                    <img src={prod.images?.[0] || 'https://via.placeholder.com/400'} alt={prod.name} style={styles.productImg} />
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{prod.name}</h3>
                    <p style={styles.productCategory}>{prod.categories?.name || 'Collection'}</p>
                    <p style={styles.productPrice}>${parseFloat(prod.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Values */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.valuesGrid}>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}><Truck size={28} color="var(--accent-color)" /></div>
              <h4 style={styles.valueTitle}>Free Standard Shipping</h4>
              <p style={styles.valueText}>Complimentary shipping applied directly on checkout for all orders over $100.</p>
            </div>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}><ShieldCheck size={28} color="var(--accent-color)" /></div>
              <h4 style={styles.valueTitle}>Sustainable Materials</h4>
              <p style={styles.valueText}>100% certified organic cottons, French terry linings, and recycled elements.</p>
            </div>
            <div style={styles.valueItem}>
              <div style={styles.valueIcon}><RefreshCw size={28} color="var(--accent-color)" /></div>
              <h4 style={styles.valueTitle}>Uncompromising Returns</h4>
              <p style={styles.valueText}>Unhappy with the fit? Exchange or return within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    height: '80vh',
    minHeight: '500px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(10, 10, 12, 0.75)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '650px',
  },
  heroSubtitle: {
    textTransform: 'uppercase',
    color: 'var(--accent-color)',
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '0.2em',
    marginBottom: '16px',
    display: 'block',
  },
  heroTitle: {
    fontSize: '3rem',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    fontWeight: 500,
    marginBottom: '20px',
    color: '#fff',
  },
  heroText: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  heroBtn: {
    padding: '16px 32px',
  },
  section: {
    padding: '100px 0',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginTop: '40px',
  },
  categoryCard: {
    position: 'relative',
    height: '400px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '24px',
  },
  categoryImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition-smooth)',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(10,10,12,0) 50%, rgba(10,10,12,0.9) 100%)',
    zIndex: 1,
  },
  categoryTitle: {
    position: 'relative',
    zIndex: 2,
    fontSize: '1.25rem',
    fontWeight: 500,
    color: '#fff',
    letterSpacing: '0.05em',
  },
  featuredHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    color: 'var(--accent-color)',
    fontWeight: 500,
  },
  productCard: {
    padding: '12px',
    cursor: 'pointer',
  },
  imgWrapper: {
    aspectRatio: '3/4',
    overflow: 'hidden',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: '16px',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition-smooth)',
  },
  productInfo: {
    padding: '0 4px',
  },
  productName: {
    fontSize: '1.05rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '4px',
  },
  productCategory: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  productPrice: {
    fontSize: '1rem',
    color: 'var(--accent-color)',
    fontWeight: 600,
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  valueItem: {
    textAlign: 'center',
    padding: '0 20px',
  },
  valueIcon: {
    marginBottom: '20px',
    display: 'inline-flex',
    justifyContent: 'center',
  },
  valueTitle: {
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '10px',
    color: '#fff',
  },
  valueText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  center: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
  }
};
