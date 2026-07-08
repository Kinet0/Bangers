-- Aura Wear Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'manager', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Categories are insertable/editable by managers and admins" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  sku TEXT UNIQUE NOT NULL,
  inventory_qty INTEGER DEFAULT 0 NOT NULL CHECK (inventory_qty >= 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  images TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are readable by everyone" ON products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
  ));

CREATE POLICY "Products are editable by managers and admins" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are readable by authenticated users" ON coupons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Coupons are editable by admins only" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0.00 NOT NULL CHECK (discount_amount >= 0),
  shipping_address JSONB NOT NULL,
  shipping_method TEXT NOT NULL,
  tracking_number TEXT,
  stripe_intent_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
  ));

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders are editable by managers and admins" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
    )
  );

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0)
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('manager', 'admin')
      ))
    )
  );

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Seed Data: Categories
INSERT INTO categories (name, slug, description) VALUES
('T-Shirts', 't-shirts', 'Premium weight everyday tees'),
('Hoodies', 'hoodies', 'Cozy organic cotton fleece hoodies'),
('Shirts', 'shirts', 'Breathable casual linen and cotton shirts'),
('Pants', 'pants', 'Minimalist tailored sweatpants and trousers')
ON CONFLICT (slug) DO NOTHING;

-- Seed Data: Products
INSERT INTO products (category_id, name, slug, description, price, sku, inventory_qty, is_active, images) VALUES
(1, 'Heavyweight Classic Tee - Charcoal', 'heavyweight-classic-tee-charcoal', 'A premium 280gsm organic cotton t-shirt with a relaxed fit. Pre-shrunk and built to last.', 35.00, 'TS-HVY-CH-01', 50, true, ARRAY['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800']),
(1, 'Heavyweight Classic Tee - Off-White', 'heavyweight-classic-tee-off-white', 'A premium 280gsm organic cotton t-shirt in our signature warm off-white color.', 35.00, 'TS-HVY-OW-02', 45, true, ARRAY['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800']),
(2, 'Organic Fleece Hoodie - Deep Black', 'organic-fleece-hoodie-black', 'Crafted from ultra-soft brushed French terry cotton. Features double-lined hood and invisible side pockets.', 85.00, 'HD-FLC-BK-01', 30, true, ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800']),
(2, 'Organic Fleece Hoodie - Muted Olive', 'organic-fleece-hoodie-olive', 'Our signature heavyweight organic fleece hoodie in an earthy muted olive shade.', 85.00, 'HD-FLC-OL-02', 25, true, ARRAY['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800']),
(3, 'Relaxed Linen Shirt - Sand', 'relaxed-linen-shirt-sand', '100% Belgian flax linen. Light, airy, and perfect for hot days. Classic collar with pearl-style buttons.', 65.00, 'SH-LIN-SD-01', 40, true, ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800']),
(4, 'Tailored Joggers - Warm Grey', 'tailored-joggers-grey', 'Slim-fit everyday trousers made with organic cotton and recycled poly blend. Features zippered cuffs.', 70.00, 'PT-TLD-GY-01', 35, true, ARRAY['https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800'])
ON CONFLICT (slug) DO NOTHING;
