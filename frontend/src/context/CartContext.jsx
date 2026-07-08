import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_URL } from './AuthContext.jsx';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { getAuthHeaders, token } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponError, setCouponError] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Clear coupon when logged out
  useEffect(() => {
    if (!token) {
      setCoupon(null);
    }
  }, [token]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.product_id === product.id);
      if (existing) {
        // Enforce inventory check
        const newQty = Math.min(product.inventory_qty, existing.quantity + quantity);
        return prevItems.map(item => 
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevItems, {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.price),
        image: product.images?.[0] || 'https://via.placeholder.com/150',
        quantity: Math.min(product.inventory_qty, quantity)
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    setCouponError('');
    if (!token) {
      setCouponError('Please log in to apply discount coupons.');
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/coupons/${code}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (!res.ok) {
        setCouponError(data.error || 'Failed to apply coupon');
        return false;
      }

      setCoupon(data);
      return true;
    } catch (err) {
      console.error(err);
      setCouponError('Network error checking coupon validity.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

  // Computations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percentage') {
      discountAmount = cartSubtotal * (parseFloat(coupon.discount_value) / 100);
    } else if (coupon.discount_type === 'flat') {
      discountAmount = parseFloat(coupon.discount_value);
    }
  }
  discountAmount = Math.min(discountAmount, cartSubtotal);

  // Free standard shipping if subtotal after discount >= $100
  const afterDiscount = cartSubtotal - discountAmount;
  let shippingCost = 5.00;
  if (shippingMethod === 'express') {
    shippingCost = 15.00;
  } else if (shippingMethod === 'standard' && afterDiscount >= 100) {
    shippingCost = 0;
  }

  // If cart is empty, shipping is 0
  if (cartItems.length === 0) {
    shippingCost = 0;
  }

  const cartTotal = Math.max(0, afterDiscount + shippingCost);

  const value = {
    cartItems,
    coupon,
    couponError,
    shippingMethod,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingMethod,
    cartSubtotal: parseFloat(cartSubtotal.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    cartTotal: parseFloat(cartTotal.toFixed(2))
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
