import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  images: string[];
  youtube_url: string;
  tags: string[];
  category: string;
  author: string;
  author_avatar: string;
  read_time: number;
  published: boolean;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
}

export function useBlogs(limit?: number) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let query = supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    query.then(({ data, error: err }) => {
      if (err) setError(err.message);
      else setBlogs(data || []);
      setLoading(false);
    });
  }, [limit]);

  return { blogs, loading, error };
}

export function useBlog(slug: string) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setBlog(data);
        setLoading(false);
      });
  }, [slug]);

  return { blog, loading, error };
}
