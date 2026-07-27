import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'social';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      isLoading = false,
      size = 'md',
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Generate variant classes
    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-indigo-100 focus:ring-indigo-500 border border-transparent';
        case 'secondary':
          return 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 focus:ring-indigo-500 border border-transparent';
        case 'outline':
          return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-indigo-500 hover:border-slate-300 shadow-sm';
        case 'danger':
          return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-transparent';
        case 'ghost':
          return 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400';
        case 'social':
          return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-indigo-500 hover:shadow-sm flex items-center justify-center gap-3 font-medium transition-colors w-full rounded-xl py-2.5 px-4 text-sm';
        default:
          return '';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3.5 py-1.5 text-xs font-semibold rounded-lg';
        case 'md':
          return 'px-4.5 py-2.5 text-sm font-semibold rounded-lg';
        case 'lg':
          return 'px-6 py-3.5 text-base font-semibold rounded-xl';
        default:
          return 'px-4.5 py-2.5 text-sm font-semibold';
      }
    };

    const baseStyle =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${getVariantClasses()} ${getSizeClasses()} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...(props as any)}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin text-current shrink-0" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
