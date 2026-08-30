'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useUiShell } from '../../hooks/useUiShell';
import AuthModal from '../auth/AuthModal';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const AUTH_MODES = new Set(['login', 'signup', 'forgot', 'reset']);

export default function ChatShell({ children }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openAuthModal } = useUiShell();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const authMode = new URLSearchParams(window.location.search).get('auth');

    if (AUTH_MODES.has(authMode)) {
      openAuthModal(authMode);
      window.history.replaceState({}, '', '/');
    }
  }, [openAuthModal]);

  if (user) {
    return (
      <div className={`relative h-screen overflow-hidden ${isDark ? 'bg-[#0D1117]' : 'bg-white'}`}>
        {/* Bottom gradient glow - Figma design */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute bottom-0 left-0 right-0 h-[40vh]"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at bottom, rgba(43, 122, 251, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at bottom, rgba(43, 122, 251, 0.08) 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-10 flex h-full min-h-0 w-full">
          <aside className="sticky top-0 hidden h-screen shrink-0 lg:block relative z-[100]">
            <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(v => !v)} />
          </aside>

          {/* Mobile Navigation */}
          <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

          <div className="flex flex-1 flex-col overflow-hidden min-h-0 min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden">
              <Header onMenuClick={() => setMobileNavOpen(true)} />
            </div>

            <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </div>

        <AuthModal />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#0D1117]' : 'bg-white'}`}>
      {/* Bottom gradient glow - Figma design */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 h-[40vh]"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at bottom, rgba(43, 122, 251, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at bottom, rgba(43, 122, 251, 0.08) 0%, transparent 70%)'
          }}
        />
      </div>

      <header className={`fixed inset-x-0 top-0 z-30 border-b backdrop-blur-xl ${isDark ? 'border-white/10 bg-[#161B22]/80' : 'border-slate-200/80 bg-white/80'}`}>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src={isDark ? '/logo dark.png' : '/logo light.png'}
              alt="AgentX"
              className="h-8 w-auto"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`rounded-2xl p-2 transition-colors ${isDark ? 'text-slate-200 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className={`whitespace-nowrap rounded-2xl border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="gradient-primary whitespace-nowrap rounded-2xl px-3 py-2 text-xs font-medium text-white shadow-[0_14px_34px_rgba(6,182,212,0.28)] transition-transform hover:-translate-y-0.5 sm:px-4 sm:text-sm"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main className="absolute inset-0 flex min-h-0 w-full flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          {children}
        </div>
      </main>

      <AuthModal />
    </div>
  );
}
