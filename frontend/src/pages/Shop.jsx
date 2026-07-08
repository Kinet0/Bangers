import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { API_URL } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const selectedCategory = searchParams.get('category') || '';

  // Load products and categories from backend
  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        // Fetch categories
        const catRes = await fetch(`${API_URL}/api/products/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        // Fetch products
        let url = `${API_URL}/api/products`;
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }
        const prodRes = await fetch(url);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        console.error('Error loading catalog data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, [selectedCategory]);

  const handleCategorySelect = (slug) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(prod => 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'price-high') return parseFloat(b.price) - parseFloat(a.price);
      // default: newest
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="container" style={styles.container}>
      <h1 className="section-title" style={styles.title}>All Collections</h1>

      <div style={styles.layout}>
        {/* Sidebar Filters */}
        <aside style={styles.sidebar}>
          <div className="glass-card" style={styles.filterGroup}>
            <h3 style={styles.filterTitle}>Collections</h3>
            <button
              onClick={() => handleCategorySelect('')}
              style={{
                ...styles.filterBtn,
                color: selectedCategory === '' ? 'var(--accent-color)' : 'var(--text-secondary)'
              }}
            >
              All Pieces
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => handleCategorySelect(cat.slug)}
                style={{
                  ...styles.filterBtn,
                  color: selectedCategory === cat.slug ? 'var(--accent-color)' : 'var(--text-secondary)'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="glass-card" style={styles.infoBox}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Free Standard Shipping</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Orders of $100 or more qualify for standard home delivery shipping at no extra cost.</p>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <main style={styles.main}>
          <div style={styles.controlsBar}>
            {/* Search Input */}
            <div style={styles.searchBox}>
              <Search size={18} color="var(--text-muted)" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Sorting Dropdown */}
            <div style={styles.sortWrapper}>
              <span style={styles.sortLabel}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={styles.center}>Loading collection pieces...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={styles.center}>No items match your search.</div>
          ) : (
            <div className="grid grid-3">
              {filteredProducts.map(prod => (
                <div className="glass-card" key={prod.id} style={styles.productCard}>
                  <Link to={`/products/${prod.slug}`} style={styles.imgLink}>
                    <div style={styles.imgWrapper}>
                      <img src={prod.images?.[0] || 'https://via.placeholder.com/400'} alt={prod.name} style={styles.productImg} />
                    </div>
                  </Link>
                  <div style={styles.productInfo}>
                    <Link to={`/products/${prod.slug}`}>
                      <h3 style={styles.productName}>{prod.name}</h3>
                    </Link>
                    <p style={styles.productCategory}>{prod.categories?.name || 'Collection'}</p>
                    <div style={styles.footerRow}>
                      <p style={styles.productPrice}>${parseFloat(prod.price).toFixed(2)}</p>
                      {prod.inventory_qty > 0 ? (
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="btn btn-primary"
                          style={styles.cartBtn}
                          title="Add to Cart"
                        >
                          <ShoppingBag size={14} /> Add
                        </button>
                      ) : (
                        <span style={styles.outBadge}>Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '40px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  filterTitle: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  filterBtn: {
    textAlign: 'left',
    fontSize: '0.95rem',
    padding: '4px 0',
    transition: 'var(--transition-smooth)',
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    position: 'relative',
    flexGrow: 1,
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px 10px 42px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  sortWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sortLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '10px 16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
  },
  productCard: {
    padding: '12px',
  },
  imgLink: {
    display: 'block',
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
    marginBottom: '12px',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: '1.05rem',
    color: 'var(--accent-color)',
    fontWeight: 600,
  },
  cartBtn: {
    padding: '6px 14px',
    fontSize: '0.75rem',
  },
  outBadge: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
  },
  center: {
    textAlign: 'center',
    padding: '80px 0',
    color: 'var(--text-secondary)',
    gridColumn: '1 / -1',
  }
};
