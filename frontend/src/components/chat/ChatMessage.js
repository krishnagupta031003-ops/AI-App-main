/**
 * ChatMessage Component
 * AI responses have no bubble background; code blocks get VS Code-style syntax highlighting.
 */

'use client';

import { useState } from 'react';
import Avatar from '../ui/Avatar';
import ProviderIcon from '../ui/ProviderIcon';
import { formatTime, copyToClipboard } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';

/* ─── Main component ─── */
export default function ChatMessage({ message, userName }) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const isUser = message.role === 'user';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = async (code, id) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div
      className={`group flex gap-2 py-4 sm:gap-4 sm:px-2 sm:py-5 lg:px-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <Avatar name={userName} size="md" className="ring-2 ring-cyan-400/20" />
        ) : (
          <img
            src={isDark ? '/Logoicon dark.png' : '/Logoicon light.png'}
            alt="AgentX"
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex min-w-0 flex-1 flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name + time + model */}
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {isUser ? 'You' : 'AgentX'}
            </span>
            {!isUser && message.model && (
              <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <ProviderIcon provider={message.provider} size={14} />
                <span>{message.model}</span>
              </span>
            )}
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message bubble - only show if there's text content */}
        {message.content && (
          <div
            className={
              isUser
                ? `inline-block max-w-full rounded-2xl px-4 py-3 shadow-sm sm:max-w-[85%] ${
                    isDark
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-100 text-slate-950 border border-slate-200'
                  }`
                : `max-w-full sm:max-w-[90%] w-full text-sm leading-7 sm:text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`
            }
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : (
            <div className="prose prose-sm max-w-[100%] overflow-x-hidden sm:prose-base dark:prose-invert prose-p:leading-7 prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0 prose-pre:overflow-hidden prose-a:text-cyan-500 hover:prose-a:text-cyan-400 prose-headings:font-bold prose-headings:tracking-tight prose-th:bg-slate-100 dark:prose-th:bg-white/10 prose-th:p-2 prose-td:p-2 prose-table:border-collapse prose-table:w-full prose-table:overflow-x-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                hr() {
                  return null;
                },
                table({ node, ...props }) {
                  return (
                    <div className="my-4 w-full overflow-x-auto rounded-xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)' }}>
                      <table className="w-full border-collapse text-left text-sm m-0" {...props} />
                    </div>
                  );
                },
                th({ node, ...props }) {
                  return <th className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${isDark ? 'border-white/10 text-slate-300 bg-white/10' : 'border-slate-200 text-slate-600 bg-slate-100'}`} {...props} />;
                },
                td({ node, ...props }) {
                  return <td className={`border px-4 py-2.5 ${isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-700'}`} {...props} />;
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  let language = match ? match[1] : 'javascript';
                  if (language === 'text' || language === 'plaintext' || language === 'pseudocode') {
                    language = 'typescript'; // force syntax highlighting
                  }
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    const blockId = codeString.slice(0, 20); // unique id for copy state
                    return (
                      <div
                        className="rounded-xl overflow-hidden border my-4 w-full max-w-full"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                          backdropFilter: 'blur(12px)',
                        }}
                      >
                        {/* Code toolbar */}
                        <div
                          style={{
                            background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)',
                            borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                          }}
                          className="flex items-center justify-between px-4 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                              {language}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(codeString, blockId)}
                            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80"
                            style={{
                              color: copiedCode === blockId ? '#10b981' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            }}
                          >
                            {copiedCode === blockId ? (
                              <>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>

                        {/* Syntax Highlighter */}
                        <SyntaxHighlighter
                          {...props}
                          style={isDark ? vscDarkPlus : vs}
                          language={language}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: '16px',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.5rem',
                            overflowX: 'hidden',
                          }}
                          wrapLines={true}
                          wrapLongLines={true}
                          lineProps={{ style: { whiteSpace: 'pre-wrap', wordBreak: 'normal', overflowWrap: 'break-word' } }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  // Inline code
                  return (
                    <code className={`rounded px-1.5 py-0.5 text-[0.85em] font-mono ${isDark ? 'bg-slate-700/80 text-emerald-300' : 'bg-slate-100 text-rose-600'}`} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        )}

        {/* Attachments - Outside the message bubble */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3 max-w-[85%] ml-auto justify-end">
            {message.attachments.map((attachment, idx) => {
              const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
              const imageSrc = attachment.url
                ? `${BACKEND_URL}${attachment.url}`
                : attachment.data;

              // Detect image by MIME type OR file extension
              const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i;
              const isImage =
                (attachment.type && String(attachment.type).startsWith('image/')) ||
                imageExtensions.test(attachment.name || '') ||
                imageExtensions.test(attachment.url || '');

              return (
                <div key={idx}>
                  {isImage ? (
                    // Image without background
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt={attachment.name || 'Image'}
                      className="max-h-60 w-auto object-contain rounded-xl"
                    />
                  ) : (
                    // Document card with background (as user preferred)
                    <a
                      href={attachment.url ? `${BACKEND_URL}${attachment.url}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-start gap-3 rounded-xl p-3 transition-colors min-w-[200px] ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 border border-white/10'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                        isDark ? 'bg-white/10' : 'bg-white'
                      }`}>
                        <svg className={`h-5 w-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {attachment.name || 'Document'}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {attachment.type || 'Document'}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Copy action */}
        <div className={`flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={handleCopy}
            className={`rounded-xl p-2 transition-all ${
              isDark
                ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-label="Copy message"
          >
            {copied ? (
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
