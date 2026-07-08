import { supabase, supabaseAdmin, dbMode } from './db.js';
import { mockCategories, mockProducts, mockCoupons, mockProfiles, mockOrders, mockOrderItems } from './mockDb.js';

export const dbService = {
  // --- CATEGORIES ---
  async getCategories() {
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return [...mockCategories];
    }
  },

  async createCategory(name, slug, description) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('categories').insert([{ name, slug, description }]).select().single();
      if (error) throw error;
      return data;
    } else {
      const newCat = { id: mockCategories.length + 1, name, slug, description, created_at: new Date().toISOString() };
      mockCategories.push(newCat);
      return newCat;
    }
  },

  // --- PRODUCTS ---
  async getProducts(categorySlug = null) {
    if (dbMode === 'supabase') {
      let query = supabase.from('products').select('*, categories(name, slug)');
      if (categorySlug) {
        query = query.filter('categories.slug', 'eq', categorySlug);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      // Filter out null categories if category filter was applied on join
      return categorySlug ? data.filter(p => p.categories !== null) : data;
    } else {
      let items = [...mockProducts];
      if (categorySlug) {
        const cat = mockCategories.find(c => c.slug === categorySlug);
        if (cat) {
          items = items.filter(p => p.category_id === cat.id);
        } else {
          return [];
        }
      }
      // Populate mock categories relationship
      return items.map(p => ({
        ...p,
        categories: mockCategories.find(c => c.id === p.category_id) || null
      }));
    }
  },

  async getProductBySlug(slug) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single();
      if (error) return null;
      return data;
    } else {
      const prod = mockProducts.find(p => p.slug === slug);
      return prod ? { ...prod } : null;
    }
  },

  async getProductById(id) {
    const prodId = parseInt(id, 10);
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('products').select('*').eq('id', isNaN(prodId) ? id : prodId).single();
      if (error) return null;
      return data;
    } else {
      const prod = mockProducts.find(p => p.id === prodId || p.id === id);
      return prod ? { ...prod } : null;
    }
  },

  async createProduct(productData) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('products').insert([productData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const newProd = {
        id: mockProducts.length + 1,
        ...productData,
        created_at: new Date().toISOString()
      };
      mockProducts.push(newProd);
      return newProd;
    }
  },

  async updateProduct(id, productData) {
    const prodId = parseInt(id, 10);
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('products').update(productData).eq('id', isNaN(prodId) ? id : prodId).select().single();
      if (error) throw error;
      return data;
    } else {
      const idx = mockProducts.findIndex(p => p.id === prodId || p.id === id);
      if (idx === -1) throw new Error('Product not found');
      mockProducts[idx] = { ...mockProducts[idx], ...productData };
      return mockProducts[idx];
    }
  },

  async deleteProduct(id) {
    const prodId = parseInt(id, 10);
    if (dbMode === 'supabase') {
      const { error } = await supabaseAdmin.from('products').delete().eq('id', isNaN(prodId) ? id : prodId);
      if (error) throw error;
      return true;
    } else {
      const idx = mockProducts.findIndex(p => p.id === prodId || p.id === id);
      if (idx === -1) throw new Error('Product not found');
      mockProducts.splice(idx, 1);
      return true;
    }
  },

  // --- COUPONS ---
  async getCouponByCode(code) {
    const upperCode = code.trim().toUpperCase();
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', upperCode).eq('is_active', true).single();
      if (error) return null;
      if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
      return data;
    } else {
      const cop = mockCoupons.find(c => c.code === upperCode && c.is_active);
      return cop ? { ...cop } : null;
    }
  },

  async getCoupons() {
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return [...mockCoupons];
    }
  },

  async createCoupon(couponData) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('coupons').insert([couponData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const newCop = {
        id: mockCoupons.length + 1,
        ...couponData,
        is_active: couponData.is_active ?? true,
        created_at: new Date().toISOString()
      };
      mockCoupons.push(newCop);
      return newCop;
    }
  },

  // --- PROFILES & AUTH FALLBACK ---
  async getProfile(userId) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) return null;
      return data;
    } else {
      const profile = mockProfiles.find(p => p.id === userId);
      return profile ? { ...profile } : null;
    }
  },

  async createProfile(profileData) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('profiles').insert([profileData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const newProfile = {
        created_at: new Date().toISOString(),
        role: 'customer',
        ...profileData
      };
      mockProfiles.push(newProfile);
      return newProfile;
    }
  },

  async updateProfile(userId, profileData) {
    if (dbMode === 'supabase') {
      const { data, error } = await supabaseAdmin.from('profiles').update(profileData).eq('id', userId).select().single();
      if (error) throw error;
      return data;
    } else {
      const idx = mockProfiles.findIndex(p => p.id === userId);
      if (idx === -1) throw new Error('Profile not found');
      mockProfiles[idx] = { ...mockProfiles[idx], ...profileData };
      return mockProfiles[idx];
    }
  },

  // --- ORDERS & TRANSACTIONS ---
  async createOrder({ user_id, total_amount, discount_amount, shipping_address, shipping_method, stripe_intent_id = null }, items) {
    if (dbMode === 'supabase') {
      // Create transaction block using Supabase database calls
      // 1. Insert order
      const { data: order, error: orderErr } = await supabaseAdmin.from('orders').insert([{
        user_id,
        total_amount,
        discount_amount,
        shipping_address,
        shipping_method,
        stripe_intent_id,
        status: stripe_intent_id ? 'pending' : 'paid' // stripe orders start pending until webhook payment verification
      }]).select().single();

      if (orderErr) throw orderErr;

      // 2. Insert items and decrement stock
      for (const item of items) {
        const { error: itemErr } = await supabaseAdmin.from('order_items').insert([{
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }]);
        if (itemErr) throw itemErr;

        // Decrement product stock using an RPC or direct update
        // We do a direct stock update for simplicity, assuming safety or service access
        const { data: prod } = await supabaseAdmin.from('products').select('inventory_qty').eq('id', item.product_id).single();
        if (prod) {
          const newQty = Math.max(0, prod.inventory_qty - item.quantity);
          await supabaseAdmin.from('products').update({ inventory_qty: newQty }).eq('id', item.product_id);
        }
      }

      return order;
    } else {
      // MOCK DB MODE
      const orderId = 'mock-order-' + Math.random().toString(36).substr(2, 9);
      const newOrder = {
        id: orderId,
        user_id,
        status: stripe_intent_id ? 'pending' : 'paid',
        total_amount,
        discount_amount,
        shipping_address,
        shipping_method,
        tracking_number: null,
        stripe_intent_id,
        created_at: new Date().toISOString()
      };

      // Decrement inventory and save items
      for (const item of items) {
        const prod = mockProducts.find(p => p.id === item.product_id);
        if (prod) {
          prod.inventory_qty = Math.max(0, prod.inventory_qty - item.quantity);
        }
        mockOrderItems.push({
          id: mockOrderItems.length + 1,
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
      }

      mockOrders.push(newOrder);
      return newOrder;
    }
  },

  async getOrders(userId = null, role = 'customer') {
    if (dbMode === 'supabase') {
      let query = supabaseAdmin.from('orders').select('*, profiles(first_name, last_name, email)');
      if (role === 'customer' && userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      let orders = [...mockOrders];
      if (role === 'customer' && userId) {
        orders = orders.filter(o => o.user_id === userId);
      }
      // Map profiles relationship
      return orders.map(o => {
        const p = mockProfiles.find(prof => prof.id === o.user_id);
        return {
          ...o,
          profiles: p ? { first_name: p.first_name, last_name: p.last_name } : null
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async getOrderById(id) {
    if (dbMode === 'supabase') {
      const { data: order, error } = await supabaseAdmin.from('orders').select('*, profiles(first_name, last_name, email)').eq('id', id).single();
      if (error) return null;

      const { data: items, error: itemsErr } = await supabaseAdmin.from('order_items').select('*, products(name, sku, images)').eq('order_id', id);
      if (itemsErr) throw itemsErr;

      return { ...order, items };
    } else {
      const order = mockOrders.find(o => o.id === id);
      if (!order) return null;

      const p = mockProfiles.find(prof => prof.id === order.user_id);
      const items = mockOrderItems
        .filter(item => item.order_id === id)
        .map(item => {
          const prod = mockProducts.find(pr => pr.id === item.product_id);
          return {
            ...item,
            products: prod ? { name: prod.name, sku: prod.sku, images: prod.images } : null
          };
        });

      return {
        ...order,
        profiles: p ? { first_name: p.first_name, last_name: p.last_name } : null,
        items
      };
    }
  },

  async updateOrderStatus(id, status, trackingNumber = null) {
    if (dbMode === 'supabase') {
      const updateData = { status };
      if (trackingNumber !== null) {
        updateData.tracking_number = trackingNumber;
      }
      const { data, error } = await supabaseAdmin.from('orders').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const idx = mockOrders.findIndex(o => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      mockOrders[idx].status = status;
      if (trackingNumber !== null) {
        mockOrders[idx].tracking_number = trackingNumber;
      }
      return mockOrders[idx];
    }
  },

  async getSalesReports() {
    if (dbMode === 'supabase') {
      // In Supabase, pull summary metrics
      const { data: orders, error } = await supabaseAdmin.from('orders').select('total_amount, status, created_at');
      if (error) throw error;
      return this.aggregateReports(orders);
    } else {
      return this.aggregateReports(mockOrders);
    }
  },

  // Helper method for report calculation
  aggregateReports(orders) {
    const totalSales = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    // Group sales by date (last 7 days)
    const salesOverTime = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      salesOverTime[dateStr] = 0;
    }

    orders.forEach(o => {
      if (o.status !== 'cancelled' && o.status !== 'refunded') {
        const dateStr = o.created_at.split('T')[0];
        if (salesOverTime[dateStr] !== undefined) {
          salesOverTime[dateStr] += parseFloat(o.total_amount);
        }
      }
    });

    const formattedSalesOverTime = Object.keys(salesOverTime).map(key => ({
      date: key,
      sales: salesOverTime[key]
    }));

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      completedOrders,
      salesOverTime: formattedSalesOverTime
    };
  }
};
