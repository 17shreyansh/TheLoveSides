import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/catalog/collections');
        if (active) {
          setCollections(data || []);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCollections();
    return () => { active = false; };
  }, []);

  return { collections, loading, error };
}
