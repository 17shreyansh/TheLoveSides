import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/catalog/rooms');
        if (active) {
          setRooms(data || []);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRooms();
    return () => { active = false; };
  }, []);

  return { rooms, loading, error };
}
