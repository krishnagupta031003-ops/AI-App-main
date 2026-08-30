/**
 * Sidebar Component
 * Main navigation sidebar for the dashboard – supports collapsed (icon-rail) mode
 * with smooth CSS transitions (no conditional rendering pop-in).
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';
import { cn, formatDate } from '../../lib/utils';

export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { conversations, currentConversation, messages, selectConversation, createConversation, deleteConversation, renameConversation } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const isDark = theme === 'dark';
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewChat = async () => {
    setIsCreating(true);
    await createConversation();
    setIsCreating(false);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleConversationClick = (convId) => {
    selectConversation(convId);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    setShowAccountMenu(false);
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleSaveRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    await renameConversation(renamingId, renameValue.trim());
    setRenamingId(null);
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  return (
    <aside
      style={{ transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)' }}
      className={cn(
        'relative flex h-screen flex-col border-r backdrop-blur-xl',
        collapsed ? 'w-[68px]' : 'w-72',
        isDark
          ? 'border-white/10 bg-[#161B22]/95 text-slate-100'
          : 'border-slate-200/80 bg-white/95 text-slate-900'
      )}
    >
      {/* ── Header Section ── */}
      <div className={cn('border-b p-3 flex flex-col gap-3', isDark ? 'border-white/10' : 'border-slate-200/80')}>

        {/* Logo row + toggle button */}
        {collapsed ? (
          /* ─── Collapsed: logo centered, toggle below ─── */
          <div className="flex flex-col items-center gap-2">
            <img
              src={isDark ? '/Logoicon dark.png' : '/Logoicon light.png'}
              alt="AgentX"
              className="h-10 w-10 shrink-0"
            />
            <button
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                isDark
                  ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              )}
            >
              <svg className="h-4 w-4" style={{ transform: 'rotate(180deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        ) : (
          /* ─── Expanded: logo + badge + spacer + toggle in a row ─── */
          <div className="flex items-center h-10 w-full gap-2">
            <img
              src={isDark ? '/logo dark.png' : '/logo light.png'}
              alt="AgentX"
              className="h-8 w-auto shrink-0"
            />
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0',
              user?.subscription === 'pro'
                ? isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            )}>
              {user?.subscription === 'pro' ? 'Pro' : 'Free'}
            </span>
            <div className="flex-1" />
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors',
                isDark
                  ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* New Chat button – text label slides out when collapsed */}
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          aria-label="New Chat"
          className={cn(
            'gradient-primary flex h-10 w-full items-center rounded-xl border-none transition-all duration-300 overflow-hidden shadow-lg text-white font-medium hover:opacity-90',
            collapsed ? 'justify-center' : 'px-6 justify-start'
          )}
        >
          {isCreating ? (
            <svg className="h-5 w-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <PlusIcon className="h-5 w-5 shrink-0" />
          )}
          <span
            className="whitespace-nowrap font-medium text-sm overflow-hidden transition-all duration-300 ease-in-out"
            style={{ width: collapsed ? 0 : undefined, opacity: collapsed ? 0 : 1, marginLeft: collapsed ? 0 : 10 }}
          >
            New Chat
          </span>
        </button>
      </div>

      {/* ── Conversation list – fades out when collapsed ── */}
      <div
        className="flex-1 overflow-y-auto p-3 transition-all duration-300 ease-in-out"
        style={{ opacity: collapsed ? 0 : 1, pointerEvents: collapsed ? 'none' : 'auto' }}
      >
        <div className={`mb-3 px-2 text-xs font-semibold uppercase tracking-[0.22em] whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Recent Chats
        </div>
        <div className="space-y-1.5">
          {conversations
            .filter((conv) => !conv.id.toString().startsWith('temp-'))
            .map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleConversationClick(conv.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleConversationClick(conv.id);
                }
              }}
              className={cn(
                'group w-full cursor-pointer rounded-2xl border px-3 py-3 text-left transition-all duration-200',
                currentConversation?.id === conv.id
                  ? isDark
                    ? 'border-cyan-400/40 bg-white/10 text-white shadow-glow'
                    : 'border-cyan-200 bg-cyan-50 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.12)]'
                  : isDark
                    ? 'border-transparent bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {renamingId === conv.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleSaveRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename();
                        } else if (e.key === 'Escape') {
                          handleCancelRename();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full rounded-lg border px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-950'
                      }`}
                      autoFocus
                    />
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium">{conv.title}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(conv.updatedAt)}</p>
                    </>
                  )}
                </div>
                {currentConversation?.id === conv.id && !renamingId && messages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      className={cn(
                        'shrink-0 flex items-center justify-center rounded-xl p-1.5 transition-colors',
                        isDark
                          ? 'text-slate-500 hover:bg-white/10 hover:text-cyan-300'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-cyan-600'
                      )}
                      onClick={(e) => handleStartRename(conv, e)}
                      aria-label="Rename conversation"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      className={cn(
                        'shrink-0 flex items-center justify-center rounded-xl p-1.5 transition-colors',
                        isDark
                          ? 'text-slate-500 hover:bg-white/10 hover:text-rose-300'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-rose-500'
                      )}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this chat?')) {
                          await deleteConversation(conv.id);
                        }
                      }}
                      aria-label="Delete conversation"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer / Account Menu ── */}
      <div className={cn('border-t p-3 relative z-[999]', isDark ? 'border-white/10' : 'border-slate-200/80')}>
        <div className="relative" ref={accountMenuRef}>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className={cn(
              'flex w-full items-center rounded-2xl p-2 transition-colors',
              collapsed ? 'justify-center' : 'gap-3 px-3',
              isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
            )}
            title={collapsed ? user?.name : undefined}
          >
            <Avatar name={user?.name} size="md" />
            <div
              className="flex flex-1 items-center justify-between overflow-hidden transition-all duration-300 ease-in-out"
              style={{ width: collapsed ? 0 : undefined, opacity: collapsed ? 0 : 1, marginLeft: collapsed ? 0 : 4 }}
            >
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-sm font-medium ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {user?.name}
                </p>
                <p className={`truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user?.email}
                </p>
              </div>
              <svg
                className={`h-5 w-5 shrink-0 transition-transform ${showAccountMenu ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showAccountMenu && (
            <div
              className={cn(
                'absolute bottom-full mb-2 rounded-2xl border shadow-2xl z-[99999]',
                collapsed ? 'left-full ml-2 w-52' : 'left-0 right-0',
                isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'
              )}
            >
              <div className="p-2">
                <Link
                  href="/account"
                  onClick={() => setShowAccountMenu(false)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    pathname === '/account'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-950'
                      : isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  )}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>
                <Link
                  href="/subscription"
                  onClick={() => setShowAccountMenu(false)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    pathname === '/subscription'
                      ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-950'
                      : isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  )}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Subscription</span>
                </Link>
                <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                <button
                  onClick={(e) => { e.preventDefault(); toggleTheme(); }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  )}
                >
                  {isDark ? (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isDark ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                  )}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
