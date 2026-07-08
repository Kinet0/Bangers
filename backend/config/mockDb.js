// Mock in-memory database store for Aura Wear local testing

export const mockCategories = [
  { id: 1, name: 'T-Shirts', slug: 't-shirts', description: 'Premium weight everyday tees' },
  { id: 2, name: 'Hoodies', slug: 'hoodies', description: 'Cozy organic cotton fleece hoodies' },
  { id: 3, name: 'Shirts', slug: 'shirts', description: 'Breathable casual linen and cotton shirts' },
  { id: 4, name: 'Pants', slug: 'pants', description: 'Minimalist tailored sweatpants and trousers' }
];

export const mockProducts = [
  {
    id: 1,
    category_id: 1,
    name: 'Heavyweight Classic Tee - Charcoal',
    slug: 'heavyweight-classic-tee-charcoal',
    description: 'A premium 280gsm organic cotton t-shirt with a relaxed fit. Pre-shrunk and built to last.',
    price: 35.00,
    sku: 'TS-HVY-CH-01',
    inventory_qty: 50,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800']
  },
  {
    id: 2,
    category_id: 1,
    name: 'Heavyweight Classic Tee - Off-White',
    slug: 'heavyweight-classic-tee-off-white',
    description: 'A premium 280gsm organic cotton t-shirt in our signature warm off-white color.',
    price: 35.00,
    sku: 'TS-HVY-OW-02',
    inventory_qty: 45,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800']
  },
  {
    id: 3,
    category_id: 2,
    name: 'Organic Fleece Hoodie - Deep Black',
    slug: 'organic-fleece-hoodie-black',
    description: 'Crafted from ultra-soft brushed French terry cotton. Features double-lined hood and invisible side pockets.',
    price: 85.00,
    sku: 'HD-FLC-BK-01',
    inventory_qty: 30,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800']
  },
  {
    id: 4,
    category_id: 2,
    name: 'Organic Fleece Hoodie - Muted Olive',
    slug: 'organic-fleece-hoodie-olive',
    description: 'Our signature heavyweight organic fleece hoodie in an earthy muted olive shade.',
    price: 85.00,
    sku: 'HD-FLC-OL-02',
    inventory_qty: 25,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800']
  },
  {
    id: 5,
    category_id: 3,
    name: 'Relaxed Linen Shirt - Sand',
    slug: 'relaxed-linen-shirt-sand',
    description: '100% Belgian flax linen. Light, airy, and perfect for hot days. Classic collar with pearl-style buttons.',
    price: 65.00,
    sku: 'SH-LIN-SD-01',
    inventory_qty: 40,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800']
  },
  {
    id: 6,
    category_id: 4,
    name: 'Tailored Joggers - Warm Grey',
    slug: 'tailored-joggers-grey',
    description: 'Slim-fit everyday trousers made with organic cotton and recycled poly blend. Features zippered cuffs.',
    price: 70.00,
    sku: 'PT-TLD-GY-01',
    inventory_qty: 35,
    is_active: true,
    images: ['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800']
  }
];

export const mockCoupons = [
  { id: 1, code: 'WELCOME10', discount_type: 'percentage', discount_value: 10.00, is_active: true },
  { id: 2, code: 'SAVE15', discount_type: 'percentage', discount_value: 15.00, is_active: true },
  { id: 3, code: 'TAKE20', discount_type: 'flat', discount_value: 20.00, is_active: true }
];

export const mockProfiles = [
  {
    id: 'mock-customer-id',
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '555-0199',
    address_line1: '123 Fashion Blvd',
    address_line2: 'Apt 4B',
    city: 'Los Angeles',
    state: 'CA',
    postal_code: '90015',
    country: 'US',
    role: 'customer',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-admin-id',
    first_name: 'Alex',
    last_name: 'Storey',
    phone: '555-0100',
    address_line1: '100 Admin HQ',
    address_line2: '',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94103',
    country: 'US',
    role: 'admin',
    created_at: new Date().toISOString()
  }
];

export const mockOrders = [];
export const mockOrderItems = [];
