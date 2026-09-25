import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/catalog/categories');
        if (active) {
          setCategories(data || []);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCategories();
    return () => { active = false; };
  }, []);

  return { categories, loading, error };
}
