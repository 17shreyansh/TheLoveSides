import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useSubCategories(categoryId = null) {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const params = {};
        if (categoryId) {
          params.categoryId = categoryId;
        }
        const { data } = await api.get('/catalog/subcategories', { params });
        if (active) {
          setSubCategories(data || []);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSubCategories();
    return () => { active = false; };
  }, [categoryId]);

  return { subCategories, loading, error };
}
