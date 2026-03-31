/*
  # Create sell_enquiries table

  1. New Tables
    - `sell_enquiries`
      - `id` (uuid, primary key)
      - `name` (text) - Full name of the seller
      - `phone` (text) - Contact phone number
      - `location` (text) - Property location
      - `message` (text) - Additional details about the property
      - `created_at` (timestamptz) - Submission timestamp

  2. Security
    - Enable RLS on `sell_enquiries` table
    - Allow anonymous inserts (public form submission)
    - Only authenticated users (admins) can select data
*/

CREATE TABLE IF NOT EXISTS sell_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sell_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a sell enquiry"
  ON sell_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view sell enquiries"
  ON sell_enquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);
