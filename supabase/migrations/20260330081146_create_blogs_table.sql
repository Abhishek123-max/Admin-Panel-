/*
  # Create Blogs Table

  ## Summary
  Creates the blogs table for the WesternProperties content marketing system.
  Supports rich blog posts with multiple images, YouTube video embeds, tags,
  SEO metadata, and social sharing.

  ## New Tables

  ### blogs
  - id: UUID primary key
  - slug: URL-friendly unique identifier
  - title: Blog post title
  - excerpt: Short summary shown in listings
  - content: Full HTML content
  - cover_image: Hero image URL
  - images: JSON array of additional image URLs
  - youtube_url: Optional embedded YouTube video URL
  - tags: JSON array of tag strings
  - category: Post category (investment, rental, legal, lifestyle, etc.)
  - author: Author name
  - author_avatar: Author avatar URL
  - read_time: Estimated reading time in minutes
  - published: Whether the post is live
  - featured: Whether to highlight in homepage
  - seo_title: Override SEO title
  - seo_description: Override meta description
  - created_at: Publication date
  - updated_at: Last modified

  ## Security
  - RLS enabled
  - Public can read published blogs
  - Authenticated admins can manage all blogs
*/

CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  youtube_url text DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  category text NOT NULL DEFAULT 'general',
  author text NOT NULL DEFAULT 'WesternProperties Team',
  author_avatar text DEFAULT '',
  read_time integer DEFAULT 5,
  published boolean DEFAULT true,
  featured boolean DEFAULT false,
  seo_title text DEFAULT '',
  seo_description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated can read all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured, published);
