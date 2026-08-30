/**
 * Header Component
 * Top header bar for mobile view
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isDark = theme === 'dark';
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl ${
        isDark
          ? 'border-white/10 bg-[#161B22]/80'
          : 'border-slate-200/80 bg-white/80'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <button
          onClick={onMenuClick}
          className={`rounded-2xl p-2 transition-colors lg:hidden ${
            isDark ? 'text-slate-200 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <img
            src={isDark ? '/logo dark.png' : '/logo light.png'}
            alt="AgentX"
            className="h-8 w-auto"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`rounded-2xl p-2 transition-all hover:scale-105 ${
              isDark ? 'text-slate-200 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <div className="relative" ref={userMenuRef}>
              <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`rounded-2xl p-1 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
            >
              <Avatar name={user?.name} size="sm" />
            </button>

            {showUserMenu && (
              <div
                className={`absolute right-0 z-50 mt-2 w-56 rounded-2xl border p-2 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl animate-slide-down ${
                  isDark
                    ? 'border-white/10 bg-slate-950/95'
                    : 'border-slate-200/80 bg-white/95'
                }`}
              >
                <div className={`border-b px-3 py-3 ${isDark ? 'border-white/10' : 'border-slate-200/80'}`}>
                  <p className={`truncate text-sm font-medium ${isDark ? 'text-white' : 'text-slate-950'}`}>
                    {user?.name}
                  </p>
                  <p className={`truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.email}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      isDark ? 'text-slate-200 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
