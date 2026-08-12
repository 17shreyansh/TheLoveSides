import React, { useState } from 'react';
import Button from '../ui/Button';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, error, success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    
    // Simulate API call
    setStatus('success');
    setEmail('');
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  return (
    <div>
      <p className="text-charcoal/70 text-sm mb-4">
        Get exclusive offers and design tips
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <input 
            type="email" 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="Your email address"
            className={`w-full bg-white border ${status === 'error' ? 'border-red-400' : 'border-charcoal/20'} rounded-md px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-pink-primary transition-colors`}
            aria-label="Email address"
          />
          {status === 'error' && (
            <p className="absolute -bottom-5 left-0 text-xs text-red-400">Please enter a valid email.</p>
          )}
          {status === 'success' && (
            <p className="absolute -bottom-5 left-0 text-xs text-green-600">Subscribed successfully!</p>
          )}
        </div>
        <Button type="submit" variant="primary" className="py-2.5 px-5 h-auto self-start">
          Join
        </Button>
      </form>
    </div>
  );
}
