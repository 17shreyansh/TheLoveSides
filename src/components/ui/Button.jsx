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
  const baseStyles = 'rounded-md px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none';
  
  const variants = {
    primary: 'bg-rose text-white hover:bg-rose-dark hover:shadow-lg',
    outline: 'bg-ivory border border-rose/20 text-charcoal hover:bg-burgundy hover:text-ivory hover:shadow-lg',
    dark: 'bg-burgundy text-ivory hover:bg-rose hover:shadow-lg',
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
