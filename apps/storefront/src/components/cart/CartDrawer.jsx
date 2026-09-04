import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';

export default function CartDrawer({ isOpen, onClose }) {
  const { state, updateQuantity, removeFromCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-cream z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
          <h2 className="font-serif text-2xl text-charcoal">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-charcoal" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {state.loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-primary"></div>
            </div>
          ) : state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <ShoppingBag className="w-16 h-16 mb-4 text-charcoal/30" />
              <p className="font-serif text-xl text-charcoal mb-2">Your cart is empty.</p>
              <p className="font-sans text-sm text-charcoal/60 mb-6">Looks like you haven't added anything yet.</p>
              <Button onClick={onClose} variant="outline">Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item._id} className="flex gap-4 border-b border-charcoal/10 pb-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-ivory">
                    <img src={item.variant?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product?.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <Link to={`/product/${item.product?.slug}`} onClick={onClose} className="hover:text-pink-primary transition-colors">
                        <h3 className="font-serif text-charcoal line-clamp-2">{item.product?.name}</h3>
                      </Link>
                      <button onClick={() => removeFromCart(item._id)} className="text-charcoal/40 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="font-sans text-xs text-charcoal/60 mt-1 mb-2">
                      {item.variant?.attributes?.map(attr => {
                        const isColor = attr.name.toLowerCase().includes('color');
                        const displayVal = isColor ? attr.value.replace(/\s*\(#[^\)]+\)\s*/g, '') : attr.value;
                        return `${attr.name}: ${displayVal}`;
                      }).join(' | ')}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-charcoal/20 rounded-lg bg-white h-8">
                        <button 
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-8 flex items-center justify-center hover:text-pink-primary transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-sans">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 flex items-center justify-center hover:text-pink-primary transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-sans font-semibold text-charcoal">₹{Number(item.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="p-6 border-t border-charcoal/10 bg-ivory/50">
            <div className="flex justify-between items-center mb-6">
              <span className="font-sans font-medium text-charcoal text-lg">Subtotal</span>
              <span className="font-sans font-bold text-charcoal text-2xl">₹{Number(state.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <Button variant="dark" className="w-full py-4 text-lg shadow-lg" onClick={handleCheckout}>
              Checkout
            </Button>
            <p className="text-center text-xs text-charcoal/60 mt-4 font-sans">
              Shipping & taxes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
