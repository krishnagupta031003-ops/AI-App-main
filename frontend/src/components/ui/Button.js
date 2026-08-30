/**
 * Button Component
 * A versatile button component with multiple variants and sizes
 */

import { cn } from '../../lib/utils';

const buttonVariants = {
  primary: 'bg-cyan-500 text-white shadow-glow hover:bg-cyan-600 hover:brightness-105',
  secondary: 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800',
  outline: 'border border-sky-200/90 text-sky-700 dark:text-sky-300 bg-sky-50/70 dark:bg-sky-950/20 hover:bg-sky-100/90 dark:hover:bg-sky-950/35',
  ghost: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80',
  danger: 'bg-rose-600 text-white shadow-[0_12px_30px_rgba(244,63,94,0.25)] hover:bg-rose-500',
};

const buttonSizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      suppressHydrationWarning
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
