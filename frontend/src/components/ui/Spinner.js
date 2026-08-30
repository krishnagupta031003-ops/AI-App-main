/**
 * Spinner Component
 * Loading spinner with different sizes
 */

import { cn } from '../../lib/utils';

export default function Spinner({ size = 'md', className = '', ...props }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div
      className={cn('inline-block animate-spin', sizes[size], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg
        className="w-full h-full"
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
    </div>
  );
}

/**
 * FullPageSpinner Component
 * Centered spinner for full-page loading states
 */
export function FullPageSpinner({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <Spinner size="xl" className="text-cyan-400" />
      {message && (
        <p className="mt-4 text-lg text-slate-300">{message}</p>
      )}
    </div>
  );
}
