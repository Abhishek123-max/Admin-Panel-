/*
  # WesternProperties - Core Schema

  ## Overview
  Creates the complete database schema for the WesternProperties real estate platform.

  ## New Tables

  ### 1. properties
  - Main property listing table
  - Supports all types: land_sale, room_rent, land_rent, commercial_rent, lease
  - Includes location data, pricing, amenities, and contact info

  ### 2. property_images
  - Multiple images per property
  - Ordered by sort_order for gallery display

  ### 3. property_nearby_places
  - Nearby amenities: schools, hospitals, beaches, airports, etc.
  - Distance stored as text (e.g., "2.5 km")

  ### 4. enquiries
  - Captures visitor enquiries with name, phone, email, and message
  - Linked to a specific property

  ## Security
  - RLS enabled on all tables
  - Public can view available properties and their related data
  - Anyone can submit enquiries (public form)
  - No unauthenticated write access to property data
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('land_sale', 'room_rent', 'land_rent', 'commercial_rent', 'lease')),
  price numeric NOT NULL,
  price_period text CHECK (price_period IN ('monthly', 'yearly', 'total', 'per_sqft')),
  area numeric,
  area_unit text DEFAULT 'sqft',
  bedrooms integer,
  bathrooms integer,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'India',
  zip_code text,
  latitude numeric,
  longitude numeric,
  featured boolean DEFAULT false,
  available boolean DEFAULT true,
  whatsapp_number text,
  cover_image text,
  amenities text[],
  agent_name text,
  agent_phone text,
  agent_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_nearby_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('school', 'college', 'hospital', 'beach', 'bus_stop', 'train_station', 'airport', 'shopping_mall', 'restaurant', 'park', 'temple', 'bank')),
  distance text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(available);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_nearby_places_property_id ON property_nearby_places(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_property_id ON enquiries(property_id);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view available properties"
  ON properties FOR SELECT
  USING (available = true);

CREATE POLICY "Public can view images of available properties"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.available = true
    )
  );

CREATE POLICY "Public can view nearby places of available properties"
  ON property_nearby_places FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_nearby_places.property_id
      AND properties.available = true
    )
  );

CREATE POLICY "Anyone can submit an enquiry"
  ON enquiries FOR INSERT
  WITH CHECK (
    name IS NOT NULL AND
    email IS NOT NULL AND
    phone IS NOT NULL
  );
