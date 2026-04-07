import { useState, useEffect } from 'react';
import { Property, PropertyType } from '../types/property';

const API_BASE_URL = "http://15.207.223.246:8000";

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
      let url = `${API_BASE_URL}/properties?`;

      if (filters.type) url += `type=${filters.type}&`;
      if (filters.city) url += `city=${filters.city}&`;
      if (filters.minPrice) url += `minPrice=${filters.minPrice}&`;
      if (filters.maxPrice) url += `maxPrice=${filters.maxPrice}&`;
      if (filters.search) url += `search=${filters.search}&`;

      const res = await fetch(url);
      const data = await res.json();

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
    fetch(`${API_BASE_URL}/properties?featured=true`)
      .then(res => res.json())
      .then(data => {
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
      try {
        const res = await fetch(`${API_BASE_URL}/properties/${id}`);
        const data = await res.json();
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }

    fetchProperty();
  }, [id]);

  return { property, loading, error };
}
