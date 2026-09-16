import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useColors() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchColors = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/catalog/products/colors');
        if (active) setColors(data);
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchColors();
    return () => { active = false; };
  }, []);

  return { colors, loading, error };
}
