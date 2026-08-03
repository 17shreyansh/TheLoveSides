import React, { createContext, useReducer, useContext } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  totalCount: 0,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      let newItems = [...state.items];
      
      if (existingItemIndex >= 0) {
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
      } else {
        newItems.push({ ...action.payload, quantity: 1 });
      }
      
      return {
        ...state,
        items: newItems,
        totalCount: state.totalCount + 1
      };
    }
    case 'REMOVE_FROM_CART': {
      const existingItem = state.items.find(item => item.id === action.payload);
      if (!existingItem) return state;

      let newItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: newItems,
        totalCount: state.totalCount - existingItem.quantity
      };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart }}>
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
