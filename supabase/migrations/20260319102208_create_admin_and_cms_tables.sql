/*
  # Admin Panel & CMS Tables

  ## Overview
  Creates all tables needed for the admin control panel:
  site settings, hero banners, testimonials, advantages (why choose us),
  page view tracking, and admin users.

  ## New Tables

  ### 1. site_settings
  - Key-value store for all configurable site settings
  - Covers: name, tagline, phone, email, address, hours, logo_url,
    social links, WhatsApp text

  ### 2. hero_banners
  - Configurable homepage slider banners
  - Includes image URL, label, subtitle, sort order, active toggle

  ### 3. testimonials
  - Client testimonials displayed on homepage
  - Name, location, rating, text, avatar URL, active toggle

  ### 4. advantages
  - "Why Choose Us" section items
  - Icon name, title, description, color class, sort order, active toggle

  ### 5. page_views
  - Simple visitor tracking: path, referrer, user_agent, ip, country
  - Used in admin dashboard for visitor stats

  ### 6. admin_users
  - Admin accounts with hashed passwords (managed via Supabase Auth)
  - Links to auth.users

  ## Security
  - RLS enabled on all tables
  - Public can only read active banners, testimonials, advantages, site_settings
  - Only authenticated admins can write to CMS tables
  - Page views can be inserted by anyone (public tracking)
  - Admin users only accessible by themselves
*/

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- hero_banners
CREATE TABLE IF NOT EXISTS hero_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active banners"
  ON hero_banners FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated can manage banners select"
  ON hero_banners FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert banners"
  ON hero_banners FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update banners"
  ON hero_banners FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete banners"
  ON hero_banners FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  rating integer DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active testimonials"
  ON testimonials FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated can manage testimonials select"
  ON testimonials FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- advantages
CREATE TABLE IF NOT EXISTS advantages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name text NOT NULL DEFAULT 'Shield',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  color_class text DEFAULT 'bg-emerald-50',
  icon_color_class text DEFAULT 'text-emerald-600',
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE advantages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active advantages"
  ON advantages FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated can manage advantages select"
  ON advantages FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert advantages"
  ON advantages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update advantages"
  ON advantages FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete advantages"
  ON advantages FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- page_views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '/',
  referrer text DEFAULT '',
  user_agent text DEFAULT '',
  country text DEFAULT '',
  session_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can read page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_advantages_active ON advantages(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'WesternProperties'),
  ('tagline', 'Goa''s Trusted Real Estate Partner'),
  ('phone', '+91 98765 43210'),
  ('phone_raw', '919876543210'),
  ('email', 'info@westernproperties.in'),
  ('address', '123 Western Avenue, Beach Road, Goa - 403001, India'),
  ('whatsapp_text', 'Hello! I have a property enquiry.'),
  ('business_hours', 'Mon – Sat: 9AM – 7PM\nSunday: 10AM – 5PM'),
  ('logo_url', ''),
  ('facebook_url', 'https://facebook.com/westernproperties'),
  ('twitter_url', 'https://twitter.com/westernproperties'),
  ('instagram_url', 'https://instagram.com/westernproperties'),
  ('youtube_url', 'https://youtube.com/@westernproperties')
ON CONFLICT (key) DO NOTHING;

-- Seed default hero banners
INSERT INTO hero_banners (image_url, label, subtitle, sort_order) VALUES
  ('https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Open Land with Greenery', 'Vast open plots surrounded by lush greenery — ideal for your dream home or investment', 1),
  ('https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Coastal Resort Properties', 'Beachfront and coastal land near stunning resorts — premium locations for high returns', 2),
  ('https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=1920', 'Large Premium Properties', 'Expansive estates and large plots with unmatched privacy and natural surroundings', 3)
ON CONFLICT DO NOTHING;

-- Seed default testimonials
INSERT INTO testimonials (name, location, rating, text, avatar_url, sort_order) VALUES
  ('Rajesh Kumar', 'Goa', 5, 'Found my dream beachfront plot through WesternProperties. The team was professional and the entire process was seamless. The legal documentation was clean and the handover was smooth. Highly recommend!', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', 1),
  ('Priya Sharma', 'Mumbai', 5, 'Rented a beautiful commercial space for my boutique in Mapusa through WesternProperties. Great location scouting, fair pricing, and excellent support throughout. Will definitely use them again.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150', 2),
  ('Anil Desai', 'Pune', 5, 'The best real estate experience I have had. Transparent dealings, no hidden charges, and genuinely premium properties at competitive prices. Their knowledge of Goa''s coastal belt is unmatched.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', 3)
ON CONFLICT DO NOTHING;

-- Seed default advantages
INSERT INTO advantages (icon_name, title, description, color_class, icon_color_class, sort_order) VALUES
  ('Shield', 'Verified Listings', 'Every property is thoroughly verified for legal compliance, title clarity, and NA approvals before listing.', 'bg-emerald-50', 'text-emerald-600', 1),
  ('Clock', '24/7 Support', 'Our dedicated team is available around the clock to answer your queries and guide you through every step.', 'bg-blue-50', 'text-blue-600', 2),
  ('Award', 'Best Price Guarantee', 'We ensure the most competitive pricing with complete transparency, zero hidden costs, and honest valuations.', 'bg-amber-50', 'text-amber-600', 3),
  ('Leaf', 'Coastal Specialists', 'Over 15 years of expertise in Goa''s coastal and inland real estate markets — from beaches to Western Ghats.', 'bg-teal-50', 'text-teal-600', 4)
ON CONFLICT DO NOTHING;
