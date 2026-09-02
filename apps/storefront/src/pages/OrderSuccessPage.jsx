import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function OrderSuccessPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h1 className="font-serif text-4xl text-charcoal mb-4">Order Successful!</h1>
        <p className="font-sans text-charcoal/70 mb-8 leading-relaxed">
          Thank you for your purchase. We've received your order and are getting it ready to ship. 
          You will receive an email confirmation shortly.
        </p>
        
        <Link to="/">
          <Button variant="dark" className="px-8 py-4 w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
