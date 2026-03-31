import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Property, PropertyType } from '../types/property';

export interface PropertyFilters {
  type?: PropertyType | '';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export function useProperties(filters: PropertyFilters = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [JSON.stringify(filters)]);

  async function fetchProperties() {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('properties')
        .select('*, property_images(url, sort_order, caption)')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (filters.type) query = query.eq('type', filters.type);
      if (filters.city) query = query.ilike('city', `%${filters.city}%`);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,city.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
        );
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setProperties(data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }

  return { properties, loading, error, refetch: fetchProperties };
}

export function useFeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('properties')
      .select('*, property_images(url, sort_order, caption)')
      .eq('available', true)
      .eq('featured', true)
      .limit(6)
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

  return { properties, loading };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchProperty() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('properties')
        .select('*, property_images(*), property_nearby_places(*)')
        .eq('id', id)
        .eq('available', true)
        .maybeSingle();

      if (err) setError(err.message);
      else setProperty(data);
      setLoading(false);
    }
    fetchProperty();
  }, [id]);

  return { property, loading, error };
}
