import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext'; // Import useAuth to listen for login state

const WishlistContext = createContext();

const initialState = {
  items: [],
  loading: true,
};

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'SET_WISHLIST':
      return {
        ...state,
        items: action.payload || [],
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_WISHLIST':
      return { ...state, items: [], loading: false };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { user } = useAuth(); // Assume AuthContext provides `user`

  const fetchWishlist = async () => {
    if (!user) {
      dispatch({ type: 'CLEAR_WISHLIST' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.get('/wishlist');
      dispatch({ type: 'SET_WISHLIST', payload: data || [] });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      dispatch({ type: 'SET_WISHLIST', payload: [] });
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      window.location.href = '/profile?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    try {
      const { data } = await api.post('/wishlist', { productId });
      dispatch({ type: 'SET_WISHLIST', payload: data || [] });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      dispatch({ type: 'SET_WISHLIST', payload: data || [] });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return state.items.some(
      (item) => item.productId === productId || item.productId?._id === productId || item.productId?.id === productId
    );
  };

  const toggleWishlist = (productId) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider value={{ state, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
