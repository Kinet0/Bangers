import express from 'express';
import { dbService } from '../config/dbService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- COUPON VALIDATION ---

// GET /api/orders/coupons/:code - Validate a promo coupon code
router.get('/coupons/:code', requireAuth, async (req, res) => {
  try {
    const coupon = await dbService.getCouponByCode(req.params.code);
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }
    res.json(coupon);
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Coupon validation failed' });
  }
});

// GET /api/orders/coupons - List all coupons (Admin/Manager only)
router.get('/coupons', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const coupons = await dbService.getCoupons();
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to retrieve coupons' });
  }
});

// POST /api/orders/coupons - Create coupon code (Admin only)
router.post('/coupons', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { code, discount_type, discount_value, is_active, expires_at } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'Code, discount_type, and discount_value are required' });
    }
    const coupon = await dbService.createCoupon({
      code,
      discount_type,
      discount_value: parseFloat(discount_value),
      is_active,
      expires_at: expires_at || null
    });
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});


// --- ORDER ENDPOINTS ---

// GET /api/orders - Get orders list (scoped by permissions)
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await dbService.getOrders(req.user.id, req.user.role);
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders list' });
  }
});

// GET /api/orders/reports/sales - Fetch sales reports (Admin only)
router.get('/reports/sales', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const reports = await dbService.getSalesReports();
    res.json(reports);
  } catch (error) {
    console.error('Error loading sales reports:', error);
    res.status(500).json({ error: 'Failed to aggregate sales reports' });
  }
});

// GET /api/orders/:id - Fetch single order details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure customers can only access their own orders
    if (req.user.role === 'customer' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Cannot view other customers\' orders' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// POST /api/orders - Create a new order (standard flow)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, total_amount, discount_amount, shipping_address, shipping_method, stripe_intent_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shipping_address || !shipping_method) {
      return res.status(400).json({ error: 'Missing required order details: items, shipping address, and shipping method are mandatory' });
    }

    // Validate stock inventory first before placing order
    for (const item of items) {
      const product = await dbService.getProductById(item.product_id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
      }
      if (product.inventory_qty < item.quantity) {
        return res.status(400).json({ error: `Insufficient inventory for product "${product.name}". Available: ${product.inventory_qty}, Requested: ${item.quantity}` });
      }
    }

    // Create the order in db (handles stock updates)
    const order = await dbService.createOrder({
      user_id: req.user.id,
      total_amount: parseFloat(total_amount),
      discount_amount: parseFloat(discount_amount || 0),
      shipping_address,
      shipping_method,
      stripe_intent_id
    }, items);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error processing order checkout:', error);
    res.status(500).json({ error: 'Failed to process order creation' });
  }
});

// PUT /api/orders/:id - Update order status (Manager/Admin only)
router.put('/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { status, tracking_number } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Order status parameter is required' });
    }

    const updated = await dbService.updateOrderStatus(req.params.id, status, tracking_number);
    res.json({
      message: 'Order updated successfully',
      order: updated
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order details' });
  }
});

export default router;
