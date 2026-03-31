/*
  # Add video_url to properties table

  Adds an optional video_url column to properties so that
  property listings can include a video walkthrough.
  If present, the detail page displays the video instead of (or in addition to) images.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE properties ADD COLUMN video_url text;
  END IF;
END $$;
