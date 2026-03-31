/*
  # Allow authenticated admins to read enquiries and all properties

  Adds SELECT policies for authenticated users on enquiries, properties,
  property_images, and property_nearby_places so the admin panel can
  display all data regardless of available status.
*/

CREATE POLICY "Authenticated can read all enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can read all properties"
  ON properties FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can manage property images"
  ON property_images FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can manage nearby places"
  ON property_nearby_places FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert nearby places"
  ON property_nearby_places FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete nearby places"
  ON property_nearby_places FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
