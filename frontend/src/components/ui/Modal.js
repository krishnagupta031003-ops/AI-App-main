/**
 * Modal Component
 * A dialog/modal overlay component with backdrop
 */

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  tone = 'dark',
  className = '',
}) {
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting for Next.js SSR
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  const surfaceClasses =
    tone === 'light'
      ? 'border-slate-200/80 bg-white/96 text-slate-950 shadow-[0_28px_90px_rgba(15,23,42,0.18)]'
      : 'border-white/10 bg-slate-950/95 text-white shadow-[0_28px_90px_rgba(2,6,23,0.45)]';

  const headerClasses =
    tone === 'light'
      ? 'border-slate-200/80'
      : 'border-white/10';

  const titleClasses =
    tone === 'light'
      ? 'text-slate-950'
      : 'text-white';

  const descriptionClasses =
    tone === 'light'
      ? 'text-slate-600'
      : 'text-slate-400';

  const closeButtonClasses =
    tone === 'light'
      ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      : 'text-slate-400 hover:bg-white/5 hover:text-white';

 return createPortal(
  <div
    className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4 animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    aria-describedby={description ? 'modal-description' : undefined}
  >
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Modal Content */}
    <div
      className={cn(
        'relative my-8 sm:my-0 w-full max-h-[90vh] overflow-y-auto rounded-[28px] backdrop-blur-xl animate-slide-up',
        surfaceClasses,
        sizes[size],
        className
      )}
    >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={cn('flex items-start justify-between border-b p-6', headerClasses)}>
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className={cn('text-xl font-semibold tracking-tight', titleClasses)}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className={cn('mt-1 text-sm leading-6', descriptionClasses)}
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn('ml-4 rounded-2xl p-2 transition-colors', closeButtonClasses)}
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/**
 * ModalFooter Component
 * Footer section for modal with action buttons
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5 mt-6',
        className
      )}
    >
      {children}
    </div>
  );
}
