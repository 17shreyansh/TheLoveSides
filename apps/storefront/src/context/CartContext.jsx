import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { api } from '../lib/api';

const CartContext = createContext();

const initialState = {
  items: [],
  totalCount: 0,
  subtotal: 0,
  loading: true,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART': {
      const cart = action.payload;
      return {
        ...state,
        items: cart.items || [],
        totalCount: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        subtotal: cart.subtotal || 0,
        loading: false,
      };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart', { withCredentials: true });
      dispatch({ type: 'SET_CART', payload: data.data || { items: [] } });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      dispatch({ type: 'SET_CART', payload: { items: [] } });
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1, variantId = null) => {
    try {
      // Use the provided variantId, or fallback to the first variant if available
      const idToUse = variantId || product.variants?.[0]?._id;
      if (!idToUse) {
        console.error('Cannot add to cart: No variant ID found', product);
        return;
      }
      
      const { data } = await api.post('/cart/items', {
        variantId: idToUse,
        quantity,
      }, { withCredentials: true });
      
      dispatch({ type: 'SET_CART', payload: data.data });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Depending on requirements, we could also fetchCart() here or show toast
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`, { withCredentials: true });
      dispatch({ type: 'SET_CART', payload: data.data });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.patch(`/cart/items/${itemId}`, { quantity }, { withCredentials: true });
      dispatch({ type: 'SET_CART', payload: data.data });
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
    }
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
