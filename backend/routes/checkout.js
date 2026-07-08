import express from 'express';
import Stripe from 'stripe';
import { dbService } from '../config/dbService.js';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecret && stripeSecret !== '' && !stripeSecret.includes('your_')) {
  stripe = new Stripe(stripeSecret);
  console.log('Stripe client initialized');
} else {
  console.log('Stripe running in SIMULATION/MOCK mode');
}

// POST /api/checkout/create-payment-intent - Create a Stripe Payment Intent
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { items, couponCode, shippingMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required for checkout' });
    }

    // 1. Calculate order total on the backend securely
    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const product = await dbService.getProductById(cartItem.product_id);
      if (!product) {
        return res.status(404).json({ error: `Product with ID ${cartItem.product_id} not found` });
      }
      
      if (product.inventory_qty < cartItem.quantity) {
        return res.status(400).json({ error: `Product "${product.name}" does not have enough stock.` });
      }

      const itemPrice = parseFloat(product.price);
      subtotal += itemPrice * cartItem.quantity;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: cartItem.quantity,
        price: itemPrice
      });
    }

    // 2. Process Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await dbService.getCouponByCode(couponCode);
      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discount = subtotal * (parseFloat(coupon.discount_value) / 100);
        } else if (coupon.discount_type === 'flat') {
          discount = parseFloat(coupon.discount_value);
        }
      }
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    // 3. Add shipping rates
    let shipping = 5.00; // default Standard
    if (shippingMethod === 'express') {
      shipping = 15.00;
    }
    // Free shipping standard rate for orders over $100 (after coupon is applied)
    if (shippingMethod === 'standard' && (subtotal - discount) >= 100) {
      shipping = 0;
    }

    const totalAmount = Math.max(0, subtotal - discount + shipping);

    // 4. Create Stripe Payment Intent or Mock Intent
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // in cents
        currency: 'usd',
        metadata: {
          userId: req.user.id,
          couponCode: couponCode || '',
          shippingMethod
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        stripeIntentId: paymentIntent.id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
        isMock: false
      });
    } else {
      // Return simulated payment credentials
      const mockStripeIntentId = 'mock-intent-' + Math.random().toString(36).substr(2, 9);
      res.json({
        clientSecret: 'mock_secret_key_intent_' + mockStripeIntentId,
        stripeIntentId: mockStripeIntentId,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
        isMock: true
      });
    }
  } catch (error) {
    console.error('Error generating payment intent:', error);
    res.status(500).json({ error: 'Failed to process payment creation request' });
  }
});

// POST /api/checkout/webhook - Stripe payment status notification
// Note: This endpoint should use express.raw({ type: 'application/json' }) if validating signatures,
// but for standard compatibility, we support raw body signature parsing or bypass in mock mode.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event = null;

  try {
    if (stripe && sig && webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Simulate webhook for locally submitted requests
      // Expect custom mock event structure sent by dev server
      if (typeof req.body === 'string') {
        event = JSON.parse(req.body);
      } else {
        event = req.body;
      }
    }
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle transaction success event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const stripeIntentId = paymentIntent.id;

    try {
      // In Supabase mode, retrieve order containing this payment intent and set status to "paid"
      // In Mock mode, locate order by Stripe intent ID
      const orders = await dbService.getOrders(null, 'admin');
      const order = orders.find(o => o.stripe_intent_id === stripeIntentId);
      
      if (order) {
        await dbService.updateOrderStatus(order.id, 'paid');
        console.log(`Payment confirmed: Order ${order.id} status updated to paid.`);
      } else {
        console.warn(`Webhook: Order with Stripe Intent ID ${stripeIntentId} not found.`);
      }
    } catch (dbErr) {
      console.error('Webhook DB update failed:', dbErr);
      return res.status(500).json({ error: 'Order fulfillment database write failed' });
    }
  }

  res.json({ received: true });
});

export default router;
