import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100',
};

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}