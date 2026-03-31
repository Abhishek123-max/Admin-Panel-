/*
  # Add Pages Content, SEO & Extended Social Media Settings

  ## Summary
  Adds new site_settings keys for:
  - Privacy Policy page content (editable HTML/text)
  - Terms & Conditions page content (editable HTML/text)
  - SEO settings: meta title, meta description, OG image URL
  - Extended social links: LinkedIn, WhatsApp business, Pinterest, Threads

  ## New Keys Added to site_settings
  - privacy_policy_content: Full HTML content for the Privacy Policy page
  - terms_content: Full HTML content for the Terms & Conditions page
  - seo_title: Default site SEO title
  - seo_description: Default meta description
  - seo_og_image: Default OG image URL for social sharing
  - linkedin_url: LinkedIn page URL
  - whatsapp_url: WhatsApp Business URL
  - pinterest_url: Pinterest profile URL
  - threads_url: Threads/Instagram Threads profile URL
*/

INSERT INTO site_settings (key, value) VALUES
  ('privacy_policy_content', ''),
  ('terms_content', ''),
  ('seo_title', 'WesternProperties — Buy, Rent & Lease Properties in Goa'),
  ('seo_description', 'Find verified land for sale, beachfront plots, rooms for rent, commercial spaces, and lease properties across Goa''s finest locations.'),
  ('seo_og_image', 'https://images.pexels.com/photos/1533720/pexels-photo-1533720.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('linkedin_url', ''),
  ('whatsapp_url', ''),
  ('pinterest_url', ''),
  ('threads_url', '')
ON CONFLICT (key) DO NOTHING;
