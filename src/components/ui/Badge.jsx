import React from 'react';
import clsx from 'clsx';

export default function Badge({ children, className }) {
  return (
    <span className={clsx(
      'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white',
      className
    )}>
      {children}
    </span>
  );
}
