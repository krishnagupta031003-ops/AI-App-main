'use client';

/**
 * Authentication Form Shell
 * Minimal full-page shell for login, signup, forgot-password, and reset-password pages.
 */

import { useTheme } from '../../contexts/ThemeContext';

export default function AuthForm({ title, description, children, footer }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.12),transparent_35%),linear-gradient(135deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(45deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px] opacity-100 pointer-events-none" />

      {/* Theme toggle */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={toggleTheme}
        className={`fixed right-4 top-4 z-30 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all hover:-translate-y-0.5 sm:right-6 sm:top-6 ${
          isDark
            ? 'border-white/10 bg-slate-950/80 text-slate-100 shadow-[0_16px_35px_rgba(2,6,23,0.3)]'
            : 'border-slate-200/80 bg-white/80 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.12)]'
        }`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? 'Light mode' : 'Dark mode'}
      </button>

      {/* Scrollable content area */}
      <div className="relative mx-auto w-full max-w-lg px-4 py-10 sm:py-16">
        <section
          className={`w-full rounded-[28px] border p-5 shadow-[0_30px_100px_rgba(2,6,23,0.18)] backdrop-blur-xl sm:rounded-[32px] sm:p-8 ${
            isDark
              ? 'border-white/10 bg-slate-950/80 text-white'
              : 'border-slate-200/80 bg-white/90 text-slate-950'
          }`}
        >
          {/* Header */}
          <div className="mb-5 space-y-2">
            <img
              src={isDark ? '/logo dark.png' : '/logo light.png'}
              alt="AgentX"
              className="h-7 w-auto sm:h-8"
            />
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className={`text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {description}
              </p>
            )}
          </div>

          {/* Form content */}
          <div>{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className={`mt-5 border-t pt-4 text-center text-sm ${
                isDark ? 'border-white/10 text-slate-400' : 'border-slate-200/80 text-slate-600'
              }`}
            >
              {footer}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
