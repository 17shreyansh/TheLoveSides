import React from 'react';
import clsx from 'clsx';

export default function Button({ 
  children, 
  variant = 'primary', 
  className, 
  onClick, 
  type = 'button',
  ...props 
}) {
  const baseStyles = 'rounded-md px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';
  
  const variants = {
    primary: 'bg-pink-primary text-white hover:bg-pink-dark hover:shadow-lg',
    outline: 'bg-transparent border border-pink-primary text-pink-primary hover:bg-pink-soft hover:text-charcoal hover:shadow-lg',
    dark: 'bg-pink-soft text-charcoal hover:bg-pink-primary hover:text-white hover:shadow-lg',
  };

  return (
    <button
      type={type}
      className={clsx(baseStyles, variants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
