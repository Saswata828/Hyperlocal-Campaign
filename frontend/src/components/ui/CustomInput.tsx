import * as React from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  showStrength?: boolean;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      type = 'text',
      showStrength = false,
      value,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const uniqueId = id || `input-${(label || '').toLowerCase().replace(/\s+/g, '-')}`;
    const currentValue = String(value || '');

    // Password strength logic
    const getStrengthInfo = (password: string) => {
      if (!password) return { label: 'None', score: 0, color: 'bg-slate-200' };
      
      let score = 0;
      if (password.length >= 8) score += 1; // Length rule
      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1; // Mixed case rule
      if (/[0-9]/.test(password)) score += 1; // Number rule
      if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special char rule

      switch (score) {
        case 1:
          return { label: 'Weak', score, color: 'bg-red-500', width: 'w-1/4' };
        case 2:
          return { label: 'Fair', score, color: 'bg-amber-500', width: 'w-2/4' };
        case 3:
          return { label: 'Good', score, color: 'bg-indigo-500', width: 'w-3/4' };
        case 4:
          return { label: 'Strong', score, color: 'bg-emerald-500', width: 'w-full' };
        default:
          return { label: 'Very Weak', score: 0.5, color: 'bg-red-500', width: 'w-1/12' };
      }
    };

    const strength = type === 'password' && showStrength ? getStrengthInfo(currentValue) : null;
    const actualType = type === 'password' && isPasswordVisible ? 'text' : type;

    return (
      <div className={`w-full text-left ${className}`} id={`${uniqueId}-container`}>
        {/* Label and Error Indicator */}
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor={uniqueId}
            className="block text-xs font-semibold text-slate-700 tracking-wide uppercase"
          >
            {label}
          </label>
          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1 text-xs font-medium text-rose-600"
              >
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Input Interactive Box */}
        <div
          className={`relative flex items-center rounded-xl bg-white border transition-all duration-200 ${
            error
              ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500'
              : isFocused
              ? 'border-blue-500 ring-4 ring-blue-500/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          {/* Left Icon (Optional) */}
          {leftIcon && (
            <div className="pl-3.5 flex items-center justify-center text-slate-400 shrink-0">
              {leftIcon}
            </div>
          )}

          {/* Actual input element */}
          <input
            id={uniqueId}
            ref={ref}
            type={actualType}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full py-2.5 px-3.5 text-slate-800 placeholder-slate-400 bg-transparent text-sm font-medium focus:outline-none placeholder-light disabled:bg-slate-50 disabled:text-slate-500 ${
              leftIcon ? 'pl-2' : ''
            } ${type === 'password' ? 'pr-10' : ''}`}
            {...props}
          />

          {/* Password Show Toggle Icon */}
          {type === 'password' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          )}
        </div>

        {/* Password Strength Indicator Area */}
        {strength && currentValue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-left"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Security strength:</span>
              <span
                className={`font-semibold ${
                  strength.score <= 1
                    ? 'text-red-500'
                    : strength.score === 2
                    ? 'text-amber-500'
                    : strength.score === 3
                    ? 'text-indigo-500'
                    : 'text-emerald-500'
                }`}
              >
                {strength.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}
              />
            </div>
          </motion.div>
        )}

        {/* Helper text display when there's no error */}
        {!error && helperText && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput';
