import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useProducts(query = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/catalog/products', { params: query });
        if (active) {
          // Transform backend data to match frontend's expected ProductCard schema
          const formatted = data.data.map(p => ({
            id: p._id, // backend _id is a string
            slug: p.slug,
            name: p.name,
            price: p.variants?.[0]?.price || 0,
            image: p.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/400x500',
            images: p.variants?.[0]?.images || [],
            rating: p.averageRating || 5,
            isNewArrival: true,
            isBestSeller: true, 
            category: p.category?.slug,
            description: p.description,
            variants: p.variants || [],
          }));
          setProducts(formatted);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => { active = false; };
  }, [JSON.stringify(query)]);

  return { products, loading, error };
}

export function useProduct(identifier) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identifier) return;

    let active = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/catalog/products/${identifier}`);
        if (active) {
          const p = data.data;
          const formatted = {
            id: p._id,
            slug: p.slug,
            name: p.name,
            price: p.variants?.[0]?.price || 0,
            image: p.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/400x500',
            images: p.variants?.[0]?.images?.length > 0 ? p.variants[0].images : ['https://via.placeholder.com/400x500', 'https://via.placeholder.com/400x500', 'https://via.placeholder.com/400x500', 'https://via.placeholder.com/400x500'],
            rating: p.averageRating || 5,
            isNewArrival: true,
            isBestSeller: true, 
            category: p.category?.slug,
            description: p.description,
            variants: p.variants || [],
          };
          setProduct(formatted);
        }
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProduct();
    return () => { active = false; };
  }, [identifier]);

  return { product, loading, error };
}
