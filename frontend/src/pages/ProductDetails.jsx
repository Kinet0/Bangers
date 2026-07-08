import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronRight, ArrowLeft, Ruler, Star } from 'lucide-react';
import { API_URL } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Charcoal');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Set default color based on title if possible
          if (data.name.toLowerCase().includes('white')) setSelectedColor('Off-White');
          else if (data.name.toLowerCase().includes('black')) setSelectedColor('Deep Black');
          else if (data.name.toLowerCase().includes('olive')) setSelectedColor('Muted Olive');
          else if (data.name.toLowerCase().includes('sand')) setSelectedColor('Sand');
          else if (data.name.toLowerCase().includes('grey')) setSelectedColor('Warm Grey');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return <div className="container" style={styles.center}>Loading item details...</div>;
  }

  if (!product) {
    return (
      <div className="container" style={styles.center}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Inject variant details in product context for cart display
    const customProduct = {
      ...product,
      name: `${product.name} (${selectedColor} / ${selectedSize})`
    };
    addToCart(customProduct, quantity);
  };

  return (
    <div className="container" style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <button onClick={() => navigate('/shop')} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      <div style={styles.grid}>
        {/* Product Images Gallery */}
        <div style={styles.gallery}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/600x800'}
            alt={product.name}
            style={styles.mainImg}
          />
        </div>

        {/* Product Details Columns */}
        <div style={styles.details}>
          <span style={styles.sku}>SKU: {product.sku}</span>
          <h1 style={styles.title}>{product.name}</h1>
          <p style={styles.price}>${parseFloat(product.price).toFixed(2)}</p>

          <div style={styles.rating}>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="var(--accent-color)" color="var(--accent-color)" />)}
            </div>
            <span style={styles.reviewCount}>5.0 (18 verified reviews)</span>
          </div>

          <p style={styles.shortDesc}>{product.description?.substring(0, 150)}...</p>

          {/* Color Selector */}
          <div style={styles.optionSection}>
            <span style={styles.optionLabel}>Color: {selectedColor}</span>
            <div style={styles.colorWrapper}>
              {['Charcoal', 'Off-White', 'Deep Black', 'Muted Olive', 'Sand', 'Warm Grey'].map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    ...styles.colorChip,
                    borderColor: selectedColor === color ? 'var(--accent-color)' : 'var(--border-color)',
                    backgroundColor: styles.colorMapping[color]
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div style={styles.optionSection}>
            <div style={styles.sizeTitleRow}>
              <span style={styles.optionLabel}>Size: {selectedSize}</span>
              <button onClick={() => setShowSizeGuide(true)} style={styles.sizeGuideBtn}>
                <Ruler size={14} /> Size Guide
              </button>
            </div>
            <div style={styles.sizeWrapper}>
              {['S', 'M', 'L', 'XL'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    ...styles.sizeChip,
                    borderColor: selectedSize === size ? 'var(--accent-color)' : 'var(--border-color)',
                    backgroundColor: selectedSize === size ? 'rgba(212, 175, 55, 0.08)' : 'transparent'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Cart Buttons */}
          <div style={styles.purchaseRow}>
            <div style={styles.qtyBox}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>-</button>
              <span style={styles.qtyValue}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.inventory_qty, q + 1))} style={styles.qtyBtn}>+</button>
            </div>

            {product.inventory_qty > 0 ? (
              <button onClick={handleAddToCart} className="btn btn-primary" style={styles.addToCartBtn}>
                <ShoppingBag size={18} /> Add to Shopping Cart
              </button>
            ) : (
              <button disabled className="btn btn-secondary" style={styles.addToCartBtn}>
                Out of Stock
              </button>
            )}
          </div>

          {product.inventory_qty <= 10 && product.inventory_qty > 0 && (
            <p style={styles.warningStock}>Running low! Only {product.inventory_qty} remaining in stock.</p>
          )}

          {/* Tabs Details */}
          <div style={styles.tabsSection}>
            <div style={styles.tabsHeaders}>
              <button
                onClick={() => setActiveTab('description')}
                style={{ ...styles.tabBtn, borderBottomColor: activeTab === 'description' ? 'var(--accent-color)' : 'transparent' }}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                style={{ ...styles.tabBtn, borderBottomColor: activeTab === 'shipping' ? 'var(--accent-color)' : 'transparent' }}
              >
                Shipping & Returns
              </button>
            </div>
            <div style={styles.tabBody}>
              {activeTab === 'description' ? (
                <p style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
              ) : (
                <ul style={styles.tabList}>
                  <li>Standard home delivery: 3-5 business days ($5, free over $100).</li>
                  <li>Express delivery: 1-2 business days ($15).</li>
                  <li>Unhappy with the fit? Returns are free within 30 days of receipt.</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Guide Modal overlay */}
      {showSizeGuide && (
        <div style={styles.modalOverlay} onClick={() => setShowSizeGuide(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', color: '#fff' }}>Aura Wear Sizing Standards (Inches)</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Sleeve Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>S</td>
                  <td>34 - 36</td>
                  <td>28 - 30</td>
                  <td>32.5</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>38 - 40</td>
                  <td>32 - 34</td>
                  <td>33.5</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>42 - 44</td>
                  <td>36 - 38</td>
                  <td>34.5</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>46 - 48</td>
                  <td>40 - 42</td>
                  <td>35.5</td>
                </tr>
              </tbody>
            </table>
            <button onClick={() => setShowSizeGuide(false)} className="btn btn-secondary" style={{ marginTop: '20px', width: '100%' }}>
              Close Sizing Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '40px',
    paddingBottom: '80px',
  },
  breadcrumb: {
    marginBottom: '24px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    transition: 'var(--transition-smooth)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '60px',
  },
  gallery: {
    aspectRatio: '3/4',
    overflow: 'hidden',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
  mainImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  sku: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 500,
    color: '#fff',
    letterSpacing: '-0.02em',
    marginBottom: '12px',
    lineHeight: 1.2,
  },
  price: {
    fontSize: '1.5rem',
    color: 'var(--accent-color)',
    fontWeight: 600,
    marginBottom: '16px',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  reviewCount: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  shortDesc: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  optionSection: {
    marginBottom: '24px',
  },
  optionLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  colorWrapper: {
    display: 'flex',
    gap: '12px',
  },
  colorChip: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid transparent',
    padding: '2px',
    cursor: 'pointer',
    backgroundClip: 'content-box',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
  },
  colorMapping: {
    'Charcoal': '#2e3033',
    'Off-White': '#f2f0ea',
    'Deep Black': '#0a0a0b',
    'Muted Olive': '#555d50',
    'Sand': '#dcd1c4',
    'Warm Grey': '#8e8d8a'
  },
  sizeTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sizeGuideBtn: {
    fontSize: '0.8rem',
    color: 'var(--accent-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sizeWrapper: {
    display: 'flex',
    gap: '10px',
  },
  sizeChip: {
    width: '45px',
    height: '45px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'var(--transition-smooth)',
  },
  purchaseRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    marginBottom: '12px',
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-secondary)',
  },
  qtyBtn: {
    width: '40px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  },
  qtyValue: {
    width: '30px',
    textAlign: 'center',
    fontWeight: 500,
  },
  addToCartBtn: {
    flexGrow: 1,
    height: '47px',
  },
  warningStock: {
    fontSize: '0.85rem',
    color: 'var(--warning)',
    marginBottom: '32px',
  },
  tabsSection: {
    marginTop: '40px',
    borderTop: '1px solid var(--border-color)',
  },
  tabsHeaders: {
    display: 'flex',
    gap: '24px',
  },
  tabBtn: {
    padding: '16px 0',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    borderBottom: '2px solid transparent',
  },
  tabBody: {
    paddingTop: '20px',
  },
  tabList: {
    paddingLeft: '20px',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: 'var(--shadow-lg)',
  },
  center: {
    textAlign: 'center',
    padding: '100px 0',
    color: 'var(--text-secondary)',
  }
};
