/**
 * Avatar Component
 * User avatar with fallback to initials
 */

import { cn } from '../../lib/utils';

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  ...props
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate background color from name
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-slate-500';

    const colors = [
      'bg-sky-500',
      'bg-cyan-500',
      'bg-teal-500',
      'bg-emerald-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-slate-600',
      'bg-zinc-600',
      'bg-stone-600',
      'bg-amber-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          'rounded-full object-cover',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full shrink-0 flex items-center justify-center font-semibold text-white aspect-square',
        sizes[size],
        getBackgroundColor(name),
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
