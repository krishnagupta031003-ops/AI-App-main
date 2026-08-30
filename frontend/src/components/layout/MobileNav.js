/**
 * MobileNav Component
 * Mobile navigation drawer
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { cn, formatDate } from '../../lib/utils';

export default function MobileNav({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { conversations, currentConversation, messages, selectConversation, createConversation, deleteConversation, renameConversation } = useChat();
  const { theme, toggleTheme } = useTheme();
  
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [showMenuId, setShowMenuId] = useState(null);
  const isDark = theme === 'dark';

  const accountMenuRef = useRef(null);
  const renameInputRef = useRef(null);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleNewChat = async () => {
    setIsCreating(true);
    await createConversation();
    setIsCreating(false);
    onClose();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleConversationClick = (convId) => {
    selectConversation(convId);
    onClose();
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    setShowAccountMenu(false);
    onClose();
    const result = await logout();
    if (result.success) {
      router.push('/login');
    }
  };

  const handleStartRename = (conv) => {
    setRenamingId(conv.id);
    setRenameTitle(conv.title);
    setShowMenuId(null);
    setTimeout(() => renameInputRef.current?.focus(), 0);
  };

  const handleSaveRename = async () => {
    if (!renameTitle.trim() || renameTitle === conversations.find(c => c.id === renamingId)?.title) {
      setRenamingId(null);
      return;
    }
    await renameConversation(renamingId, renameTitle.trim());
    setRenamingId(null);
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameTitle('');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        onClick={onClose}
      />

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[88vw] max-w-sm flex flex-col overflow-hidden border-r shadow-[16px_0_80px_rgba(2,6,23,0.35)] backdrop-blur-xl lg:hidden animate-slide-in-left ${
          isDark
            ? 'border-white/10 bg-[#161B22]/95 text-slate-100'
            : 'border-slate-200/80 bg-white/95 text-slate-900'
        }`}
      >
        <div className={`flex items-center justify-between border-b p-4 ${isDark ? 'border-white/10' : 'border-slate-200/80'}`}>
          <div className="flex items-center gap-3">
            <img
              src={isDark ? '/logo dark.png' : '/logo light.png'}
              alt="AgentX"
              className="h-8 w-auto"
            />
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              user?.subscription === 'pro'
                ? isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {user?.subscription === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className={`rounded-2xl p-2 transition-colors ${
                isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="h-5 w-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className={`rounded-2xl p-2 transition-colors ${
                isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
              }`}
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`border-b p-4 ${isDark ? 'border-white/10' : 'border-slate-200/80'}`}>
          <button
            onClick={handleNewChat}
            disabled={isCreating}
            className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-white font-medium shadow-lg hover:opacity-90 transition"
          >
            {isCreating ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <PlusIcon className="h-5 w-5" />
            )}
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className={`mb-3 text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Recent Chats
          </div>
          <div className="space-y-2">
            {conversations
              .filter((conv) => !conv.id.toString().startsWith('temp-'))
              .map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative w-full rounded-2xl border px-3 py-3 transition-all duration-200',
                  currentConversation?.id === conv.id
                    ? isDark
                      ? 'border-cyan-400/40 bg-white/10 text-white shadow-glow'
                      : 'border-cyan-200 bg-cyan-50 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.12)]'
                    : isDark
                      ? 'border-transparent bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                      : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
                )}
              >
                {renamingId === conv.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameTitle}
                      onChange={(e) => setRenameTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                      onBlur={handleSaveRename}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-1 text-sm font-medium outline-none',
                        isDark
                          ? 'border-white/20 bg-white/10 text-white placeholder:text-slate-400'
                          : 'border-slate-300 bg-white text-slate-950 placeholder:text-slate-400'
                      )}
                      placeholder="Chat name..."
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => handleConversationClick(conv.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleConversationClick(conv.id);
                      }
                    }}
                    className="flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{conv.title}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(conv.updatedAt)}</p>
                    </div>
                    {currentConversation?.id === conv.id && messages.length > 0 && (
                      <div className="relative shrink-0">
                        <button
                        className={cn(
                          'rounded-xl p-1.5 transition-colors',
                          isDark
                            ? 'text-slate-500 hover:bg-white/10 hover:text-white'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-950'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenuId(showMenuId === conv.id ? null : conv.id);
                        }}
                        aria-label="More options"
                      >
                        <DotsIcon className="h-4 w-4" />
                      </button>
                      {showMenuId === conv.id && (
                        <div
                          className={cn(
                            'absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border shadow-lg',
                            isDark
                              ? 'border-white/10 bg-slate-900'
                              : 'border-slate-200 bg-white'
                          )}
                        >
                          <div className="p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename(conv);
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                isDark
                                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                              )}
                            >
                              <EditIcon className="h-4 w-4" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setShowMenuId(null);
                                if (window.confirm('Are you sure you want to delete this chat?')) {
                                  await deleteConversation(conv.id);
                                }
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                isDark
                                  ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                                  : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                              )}
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`border-t p-4 mt-auto ${isDark ? 'border-white/10' : 'border-slate-200/80'}`}>
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Avatar name={user?.name} size="md" />
              <div className="min-w-0 flex-1 text-left">
                <p className={`truncate text-sm font-medium ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {user?.name}
                </p>
                <p className={`truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user?.email}
                </p>
              </div>
              <svg
                className={`h-5 w-5 transition-transform ${showAccountMenu ? 'rotate-180' : ''} ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAccountMenu && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 rounded-2xl border shadow-lg z-50 ${
                  isDark
                    ? 'border-white/10 bg-slate-900'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="p-2">
                  <Link
                    href="/account"
                    onClick={() => setShowAccountMenu(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      pathname === '/account'
                        ? isDark
                          ? 'bg-white/10 text-white'
                          : 'bg-slate-100 text-slate-950'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/subscription"
                    onClick={() => setShowAccountMenu(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      pathname === '/subscription'
                        ? isDark
                          ? 'bg-white/10 text-white'
                          : 'bg-slate-100 text-slate-950'
                        : isDark
                          ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Subscription</span>
                  </Link>
                  <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                  <button
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      isDark
                        ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                        : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    </>
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

function DotsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      />
    </svg>
  );
}

function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
