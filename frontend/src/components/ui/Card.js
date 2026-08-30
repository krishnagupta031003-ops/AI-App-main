/**
 * Card Component
 * A container component with optional glassmorphism effect
 */

import { cn } from '../../lib/utils';

export default function Card({
  children,
  glass = false,
  noPadding = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300',
        glass
          ? 'glass'
          : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-700/80 shadow-[0_18px_60px_rgba(15,23,42,0.10)] hover:shadow-[0_22px_70px_rgba(15,23,42,0.14)]',
        !noPadding && 'p-6 sm:p-7',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader Component
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-5', className)}>
      {children}
    </div>
  );
}

/**
 * CardTitle Component
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50', className)}>
      {children}
    </h3>
  );
}

/**
 * CardDescription Component
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400', className)}>
      {children}
    </p>
  );
}

/**
 * CardContent Component
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

/**
 * CardFooter Component
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-5 flex flex-wrap items-center gap-3', className)}>
      {children}
    </div>
  );
}
