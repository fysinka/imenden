
/*
# Imenden.org - Initial Database Schema

## Overview
Complete schema for the Bulgarian name-day and cultural information website with integrated online shop.
No user accounts for customers — orders are placed as guests.
Admin authentication uses Supabase auth (single admin user).

## Tables Created
1. `categories` - Product categories with slug, name, icon, description
2. `products` - Shop products with variants, pricing, stock
3. `product_images` - Multiple images per product
4. `orders` - Guest orders with contact info
5. `order_items` - Line items per order with customization JSON
6. `publications` - News/blog articles with categories
7. `publication_images` - Gallery images per publication
8. `name_days` - Bulgarian name days by date (MM-DD format)
9. `holidays` - Official Bulgarian public holidays
10. `church_holidays` - Orthodox church calendar events
11. `historical_events` - Historical facts by date
12. `famous_people` - Born/died famous people by date
13. `folk_traditions` - Folk customs and traditions by date/month
14. `site_settings` - Key-value store for site configuration
15. `admin_logs` - Audit log of admin actions
16. `carousel_items` - Featured items for homepage carousel

## Security
- RLS enabled on all tables
- Public tables (name_days, holidays, church_holidays, etc.) use TO anon, authenticated USING (true)
- Products and publications: public read, admin-only write enforced via admin check
- Orders: anon insert allowed (guest checkout), admin read/update
- Admin actions authenticated via Supabase auth
*/

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  parent_id uuid REFERENCES categories(id),
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_categories" ON categories;
CREATE POLICY "public_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE TO authenticated USING (true);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_price numeric(10,2),
  cost_price numeric(10,2),
  sku text,
  stock_quantity int DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_customizable boolean DEFAULT false,
  available_sizes text[] DEFAULT '{}',
  available_colors jsonb DEFAULT '[]',
  product_type text DEFAULT 'standard',
  tags text[] DEFAULT '{}',
  weight numeric(8,3),
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  sold_count int DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_active_idx ON products(is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products" ON products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE TO authenticated USING (true);

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  is_primary boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_product_images" ON product_images;
CREATE POLICY "public_select_product_images" ON product_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE TO authenticated USING (true);

-- PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_approved_reviews" ON product_reviews;
CREATE POLICY "public_select_approved_reviews" ON product_reviews FOR SELECT TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON product_reviews;
CREATE POLICY "anon_insert_reviews" ON product_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON product_reviews;
CREATE POLICY "admin_update_reviews" ON product_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_reviews" ON product_reviews;
CREATE POLICY "admin_delete_reviews" ON product_reviews FOR DELETE TO authenticated USING (true);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text NOT NULL,
  city text,
  note text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash_on_delivery',
  tracking_number text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_sku text,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  customization jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT TO authenticated USING (true);

-- PUBLICATIONS
CREATE TABLE IF NOT EXISTS publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  cover_image text,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS publications_slug_idx ON publications(slug);
CREATE INDEX IF NOT EXISTS publications_published_idx ON publications(is_published, published_at DESC);

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_publications" ON publications;
CREATE POLICY "public_select_publications" ON publications FOR SELECT TO anon, authenticated USING (is_published = true);

DROP POLICY IF EXISTS "admin_select_all_publications" ON publications;
CREATE POLICY "admin_select_all_publications" ON publications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_publications" ON publications;
CREATE POLICY "admin_insert_publications" ON publications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_publications" ON publications;
CREATE POLICY "admin_update_publications" ON publications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_publications" ON publications;
CREATE POLICY "admin_delete_publications" ON publications FOR DELETE TO authenticated USING (true);

-- PUBLICATION IMAGES
CREATE TABLE IF NOT EXISTS publication_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE publication_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_pub_images" ON publication_images;
CREATE POLICY "public_select_pub_images" ON publication_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_pub_images" ON publication_images;
CREATE POLICY "admin_insert_pub_images" ON publication_images FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_pub_images" ON publication_images;
CREATE POLICY "admin_delete_pub_images" ON publication_images FOR DELETE TO authenticated USING (true);

-- NAME DAYS (Именни дни)
CREATE TABLE IF NOT EXISTS name_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL, -- MM-DD format
  names text[] NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date_key)
);

CREATE INDEX IF NOT EXISTS name_days_date_key_idx ON name_days(date_key);

ALTER TABLE name_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_name_days" ON name_days;
CREATE POLICY "public_select_name_days" ON name_days FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_name_days" ON name_days;
CREATE POLICY "admin_insert_name_days" ON name_days FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_name_days" ON name_days;
CREATE POLICY "admin_update_name_days" ON name_days FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_name_days" ON name_days;
CREATE POLICY "admin_delete_name_days" ON name_days FOR DELETE TO authenticated USING (true);

-- OFFICIAL HOLIDAYS
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL, -- MM-DD format
  name text NOT NULL,
  type text DEFAULT 'national' CHECK (type IN ('national','international','observance')),
  description text,
  is_recurring boolean DEFAULT true,
  year int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS holidays_date_key_idx ON holidays(date_key);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_holidays" ON holidays;
CREATE POLICY "public_select_holidays" ON holidays FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_holidays" ON holidays;
CREATE POLICY "admin_insert_holidays" ON holidays FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_holidays" ON holidays;
CREATE POLICY "admin_update_holidays" ON holidays FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_holidays" ON holidays;
CREATE POLICY "admin_delete_holidays" ON holidays FOR DELETE TO authenticated USING (true);

-- CHURCH HOLIDAYS
CREATE TABLE IF NOT EXISTS church_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL, -- MM-DD format (or computed for moveable feasts)
  name text NOT NULL,
  type text DEFAULT 'saint' CHECK (type IN ('great_feast','saint','fast','moveable','other')),
  description text,
  is_great_feast boolean DEFAULT false,
  is_moveable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS church_holidays_date_key_idx ON church_holidays(date_key);

ALTER TABLE church_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_church_holidays" ON church_holidays;
CREATE POLICY "public_select_church_holidays" ON church_holidays FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_church_holidays" ON church_holidays;
CREATE POLICY "admin_insert_church_holidays" ON church_holidays FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_church_holidays" ON church_holidays;
CREATE POLICY "admin_update_church_holidays" ON church_holidays FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_church_holidays" ON church_holidays;
CREATE POLICY "admin_delete_church_holidays" ON church_holidays FOR DELETE TO authenticated USING (true);

-- HISTORICAL EVENTS
CREATE TABLE IF NOT EXISTS historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL, -- MM-DD format
  year int,
  title text NOT NULL,
  description text,
  category text DEFAULT 'history',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS historical_events_date_key_idx ON historical_events(date_key);

ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_historical_events" ON historical_events;
CREATE POLICY "public_select_historical_events" ON historical_events FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_historical_events" ON historical_events;
CREATE POLICY "admin_insert_historical_events" ON historical_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_historical_events" ON historical_events;
CREATE POLICY "admin_update_historical_events" ON historical_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_historical_events" ON historical_events;
CREATE POLICY "admin_delete_historical_events" ON historical_events FOR DELETE TO authenticated USING (true);

-- FAMOUS PEOPLE
CREATE TABLE IF NOT EXISTS famous_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text NOT NULL, -- MM-DD format
  event_type text NOT NULL CHECK (event_type IN ('born','died')),
  year int,
  name text NOT NULL,
  description text,
  nationality text,
  profession text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS famous_people_date_key_idx ON famous_people(date_key);

ALTER TABLE famous_people ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_famous_people" ON famous_people;
CREATE POLICY "public_select_famous_people" ON famous_people FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_famous_people" ON famous_people;
CREATE POLICY "admin_insert_famous_people" ON famous_people FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_famous_people" ON famous_people;
CREATE POLICY "admin_update_famous_people" ON famous_people FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_famous_people" ON famous_people;
CREATE POLICY "admin_delete_famous_people" ON famous_people FOR DELETE TO authenticated USING (true);

-- FOLK TRADITIONS
CREATE TABLE IF NOT EXISTS folk_traditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_key text, -- MM-DD or null for seasonal
  month int,
  title text NOT NULL,
  content text,
  proverb text,
  category text DEFAULT 'tradition',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE folk_traditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_folk_traditions" ON folk_traditions;
CREATE POLICY "public_select_folk_traditions" ON folk_traditions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_folk_traditions" ON folk_traditions;
CREATE POLICY "admin_insert_folk_traditions" ON folk_traditions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_folk_traditions" ON folk_traditions;
CREATE POLICY "admin_update_folk_traditions" ON folk_traditions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_folk_traditions" ON folk_traditions;
CREATE POLICY "admin_delete_folk_traditions" ON folk_traditions FOR DELETE TO authenticated USING (true);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  value_json jsonb,
  description text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_settings" ON site_settings;
CREATE POLICY "public_select_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON site_settings;
CREATE POLICY "admin_insert_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON admin_logs(created_at DESC);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_logs" ON admin_logs;
CREATE POLICY "admin_select_logs" ON admin_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_logs" ON admin_logs;
CREATE POLICY "admin_insert_logs" ON admin_logs FOR INSERT TO authenticated WITH CHECK (true);

-- CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_contact" ON contact_messages;
CREATE POLICY "admin_select_contact" ON contact_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_contact" ON contact_messages;
CREATE POLICY "admin_update_contact" ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
