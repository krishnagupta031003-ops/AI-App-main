/**
 * ChatInput Component – polished composer with ChatGPT-style model picker modal
 */

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { chatAPI } from '../../lib/api';

/* ─── Model data ─── */
const MODEL_CATEGORIES = ['Popular', 'Latest', 'Cheapest'];

const ALL_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    label: 'Google',
    description: 'Fast & efficient multimodal',
    categories: ['Popular', 'Cheapest'],
    icon: '✦',
    iconColor: '#4285F4',
    badge: null,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT-OSS 20B',
    provider: 'groq',
    label: 'Groq',
    description: 'Open-source, lightning fast',
    categories: ['Popular', 'Latest'],
    icon: '⚡',
    iconColor: '#F97316',
    badge: null,
  },
];

/* ─── Model icon SVGs by provider ─── */
function ProviderIcon({ provider, color, size = 22 }) {
  if (provider === 'gemini') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 12l10 10 10-10L12 2z" fill={color} opacity="0.9" />
        <path d="M12 6l-6 6 6 6 6-6-6-6z" fill="white" opacity="0.7" />
      </svg>
    );
  }
  if (provider === 'groq') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={color} opacity="0.9" />
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'white', fontSize: size * 0.45, fontWeight: 700 }}>{provider[0].toUpperCase()}</span>
    </div>
  );
}

/* ─── Model Picker Modal ─── */
function ModelPickerModal({ models, selectedModel, onSelect, onClose, isDark }) {
  const [activeCategory, setActiveCategory] = useState('Popular');

  const filtered = useMemo(() => {
    return models.filter((m) => m.categories.includes(activeCategory));
  }, [models, activeCategory]);

  // Close on backdrop click
  const backdropRef = useRef(null);
  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const selectedObj = models.find((m) => m.id === selectedModel);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg flex flex-col rounded-3xl shadow-2xl animate-scale-in ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-slate-200'}`}
        style={{ maxHeight: '85vh' }}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose a model</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              picks the best model for your task
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 px-6 pb-4">
          {MODEL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-cyan-500 border-cyan-500 text-white shadow-md'
                  : isDark
                    ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Auto mode strip */}
        <div className="mx-6 mb-4">
          <div
            onClick={() => { onSelect('gemini-2.5-flash'); onClose(); }}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${
              selectedModel === 'gemini-2.5-flash'
                ? isDark
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-emerald-300 bg-emerald-50'
                : isDark
                  ? 'border-white/10 bg-white/5 hover:bg-white/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #4285F4, #0F9D58)' }}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Auto Mode <span className={`font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>(Gemini 2.5 Flash)</span>
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>routes the best model for you</p>
            </div>
            {selectedModel === 'gemini-2.5-flash' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 mb-4 flex items-center gap-3">
          <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or pick your own</span>
          <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
        </div>

        {/* Model grid – scrollable, hidden scrollbar */}
        <div className="overflow-y-auto px-6 pb-4 no-scrollbar" style={{ maxHeight: 260 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((model) => {
              const isSelected = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => { onSelect(model.id); onClose(); }}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all w-full ${
                    isSelected
                      ? isDark
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-cyan-300 bg-cyan-50'
                      : isDark
                        ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: model.iconColor + '22' }}
                  >
                    <ProviderIcon provider={model.provider} color={model.iconColor} size={20} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {model.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {model.label}
                    </p>
                  </div>
                  {model.badge && (
                    <span className="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                      {model.badge}
                    </span>
                  )}
                  {/* Selection indicator */}
                  <div
                    className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500'
                        : isDark
                          ? 'border-slate-600'
                          : 'border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className={`border-t p-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(6,182,212,0.39)] transition-transform hover:scale-[1.02] active:scale-95"
          >
            Continue with {selectedObj?.name || 'selected model'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main ChatInput ─── */
export default function ChatInput({
  onSend,
  onStop,
  disabled = false,
  placeholder = 'Message...',
  guestLimitReached = false,
  onAuthRequest,
  isSending: externalIsSending = false,
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const isActuallySending = externalIsSending || isSending;
  const [isFocused, setIsFocused] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [showModelModal, setShowModelModal] = useState(false);
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [preVoiceMessage, setPreVoiceMessage] = useState(''); // Track message before voice
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const uploadDropdownRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isRecording, transcript, error: voiceError, isSupported: isVoiceSupported, startRecording, stopRecording, clearTranscript } = useVoiceRecorder();

  // Update message with voice transcript - append to existing text
  useEffect(() => {
    if (isRecording && transcript) {
      // Combine pre-voice message with transcript
      const combined = preVoiceMessage ? `${preVoiceMessage} ${transcript}` : transcript;
      setMessage(combined);
    }
  }, [transcript, isRecording, preVoiceMessage]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (uploadDropdownRef.current && !uploadDropdownRef.current.contains(event.target)) {
        setShowUploadDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { user } = useAuth();

  const models = ALL_MODELS;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Capture current message BEFORE stopping recording
    const currentMessage = message.trim();

    if ((!currentMessage && selectedFiles.length === 0) || disabled || isSending || guestLimitReached) return;

    // Stop voice recording if active (do this AFTER capturing message)
    if (isRecording) {
      stopRecording();
      clearTranscript();
    }

    setIsSending(true);
    try {
      let attachments = [];
      if (selectedFiles.length > 0) {
        // Upload physical files to the server first
        const filesToUpload = selectedFiles.map(f => f.file);
        const uploadedData = await chatAPI.uploadFiles(filesToUpload);
        attachments = uploadedData;
      }

      const selectedModelObj = models.find((m) => m.id === selectedModel);

      // Use captured message, not state (important!)
      await onSend(currentMessage, selectedModel, selectedModelObj?.provider || 'gemini', attachments);
      setMessage('');
      setPreVoiceMessage(''); // Clear pre-voice message
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      // Manually trigger form submission by calling handleSubmit directly
      // Create a synthetic form event
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
      };

      handleSubmit(syntheticEvent);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesToAdd = [];

      // Check each file for duplicates
      Array.from(files).forEach((file) => {
        // Create unique file identifier
        const fileKey = `${file.name}-${file.size}`;

        // Check against already selected files
        const isDuplicateInSelected = selectedFiles.some(
          (existingFile) => `${existingFile.name}-${existingFile.size}` === fileKey
        );

        // Check against files in current batch
        const isDuplicateInBatch = filesToAdd.some(
          (batchFile) => `${batchFile.name}-${batchFile.size}` === fileKey
        );

        if (!isDuplicateInSelected && !isDuplicateInBatch) {
          filesToAdd.push(file);
        }
      });

      // Process non-duplicate files
      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Double-check for duplicates before adding to state (race condition protection)
          setSelectedFiles((prev) => {
            const fileKey = `${file.name}-${file.size}`;
            const alreadyExists = prev.some(
              (existingFile) => `${existingFile.name}-${existingFile.size}` === fileKey
            );

            if (alreadyExists) {
              return prev; // Skip if duplicate
            }

            const newFile = {
              id: Math.random().toString(36).substr(2, 9),
              file,
              name: file.name,
              size: file.size,
              type: file.type,
              base64: reader.result,
            };
            return [...prev, newFile];
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear input values to allow selecting the same file again if needed
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
  };

  const canSend = (message.trim() || selectedFiles.length > 0) && !disabled && !isActuallySending && !guestLimitReached;
  const isComposerLocked = disabled || guestLimitReached;
  const selectedModelObj = models.find((m) => m.id === selectedModel);

  return (
    <>
      {/* Model picker modal */}
      {showModelModal && (
        <ModelPickerModal
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          onClose={() => setShowModelModal(false)}
          isDark={isDark}
        />
      )}

      <div className="flex-shrink-0 bg-transparent pb-2">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            {guestLimitReached && typeof onAuthRequest === 'function' && (
              <div className={`mb-3 rounded-3xl border p-4 shadow-[0_16px_50px_rgba(2,6,23,0.12)] ${isDark ? 'border-rose-400/20 bg-rose-400/10 text-rose-50' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Guest limit reached</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-rose-100/80' : 'text-rose-600'}`}>
                      Free messages ended for today. Sign in to continue.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAuthRequest('login')}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium ${isDark ? 'border-white/10 bg-white/5 text-white' : 'border-rose-200 bg-white text-rose-700'}`}
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => onAuthRequest('signup')}
                      className="rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-sm font-medium text-white"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Attachment compatibility warning */}
            {selectedFiles.length > 0 && selectedModelObj?.provider !== 'gemini' && (
              <div className={`mb-3 rounded-2xl border p-3.5 ${isDark ? 'border-amber-400/30 bg-amber-400/10' : 'border-amber-300 bg-amber-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${isDark ? 'bg-amber-400/20' : 'bg-amber-100'}`}>
                    <svg className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                      {selectedModelObj?.name || 'This model'} doesn't support attachments
                    </p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
                      Please switch to Gemini or another supported model
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedModel('gemini-2.5-flash')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isDark
                        ? 'bg-amber-400/20 text-amber-200 hover:bg-amber-400/30'
                        : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    }`}
                  >
                    Switch to Gemini
                  </button>
                </div>
              </div>
            )}

            <div
              className={`flex flex-col gap-2 rounded-3xl border p-2.5 shadow-sm transition-all sm:gap-3 sm:p-4 ${
                isFocused
                  ? isDark
                    ? 'border-slate-600 bg-slate-800/90 ring-2 ring-slate-600/20'
                    : 'border-slate-300 bg-white ring-2 ring-slate-300/20'
                  : isDark
                    ? 'border-white/10 bg-slate-800/50'
                    : 'border-slate-200/80 bg-white/50'
              }`}
            >
              {/* Selected Files (Top Row) */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 w-full">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative group"
                    >
                      {file.type?.startsWith('image/') ? (
                        /* Image thumbnail preview */
                        <div className={`relative rounded-xl overflow-hidden border ${
                          isDark ? 'border-white/10' : 'border-slate-200'
                        }`} style={{ width: 64, height: 64 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.base64}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        /* Document chip */
                        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                          isDark ? 'border-slate-700 bg-slate-700/50 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}>
                          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button type="button" onClick={() => removeFile(file.id)} className="rounded p-0.5 hover:bg-slate-600/50">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile: Stacked Layout */}
              <div className="flex flex-col gap-2 sm:hidden w-full">
                {/* Textarea - Full width on mobile */}
                <div className="w-full">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={isComposerLocked || isSending}
                    rows={1}
                    className={`w-full max-h-32 resize-none bg-transparent px-1 py-2 text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark ? 'text-slate-50 placeholder:text-slate-500' : 'text-slate-950 placeholder:text-slate-400'
                    }`}
                    aria-label="Message input"
                  />
                </div>

                {/* Controls Row - Mobile */}
                <div className="flex items-center gap-2 w-full">
                  {/* File Upload Dropdown */}
                  <div className="relative" ref={uploadDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowUploadDropdown(!showUploadDropdown)}
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                          : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                      aria-label="Add attachment"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>

                    {showUploadDropdown && (
                      <div className={`absolute bottom-full left-0 mb-2 w-48 rounded-2xl border shadow-lg z-10 ${isDark ? 'border-white/10 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => { imageInputRef.current?.click(); setShowUploadDropdown(false); }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { fileInputRef.current?.click(); setShowUploadDropdown(false); }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Upload Document</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Inputs */}
                  <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" multiple />
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.json" onChange={handleFileChange} className="hidden" multiple />

                  {/* Model Selector - Desktop only in this row */}
                  <button
                    type="button"
                    onClick={() => setShowModelModal(true)}
                    className={`hidden sm:flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors ${
                      isDark
                        ? 'border-slate-700 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    aria-label="Select model"
                  >
                    <ProviderIcon provider={selectedModelObj?.provider || 'gemini'} color={selectedModelObj?.iconColor || '#4285F4'} size={16} />
                    <span className="whitespace-nowrap">{selectedModelObj?.name}</span>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Model Selector - Mobile only */}
                  <button
                    type="button"
                    onClick={() => setShowModelModal(true)}
                    className={`flex flex-1 h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition-colors ${
                      isDark
                        ? 'border-slate-700 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    aria-label="Select model"
                  >
                    <ProviderIcon provider={selectedModelObj?.provider || 'gemini'} color={selectedModelObj?.iconColor || '#4285F4'} size={14} />
                    <span className="flex-1 text-left truncate">{selectedModelObj?.name}</span>
                    <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Voice Input Button - Mobile */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (e.detail === 0) return;
                        if (isRecording) {
                          stopRecording();
                        } else {
                          setPreVoiceMessage(message.trim());
                          clearTranscript();
                          startRecording();
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                            }
                          }, 50);
                        }
                      }}
                      onKeyDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }}
                      disabled={isComposerLocked}
                      tabIndex={-1}
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                          : isDark
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                      aria-label={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      {isRecording ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Send/Stop Button - Mobile */}
                  <button
                    type={isActuallySending ? "button" : "submit"}
                    onClick={isActuallySending ? onStop : undefined}
                    disabled={!canSend && !isActuallySending}
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                      isActuallySending
                        ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                        : canSend
                          ? 'gradient-primary text-white hover:opacity-90'
                          : isDark
                            ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                            : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    }`}
                    aria-label={isActuallySending ? "Stop generating" : "Send message"}
                  >
                    {isActuallySending ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop: Single Row Layout */}
              <div className="hidden sm:flex items-center gap-3 w-full">
                {/* File Upload Button */}
                <div className="relative" ref={uploadDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowUploadDropdown(!showUploadDropdown)}
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isDark
                        ? 'border-slate-700 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    aria-label="Add attachment"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {showUploadDropdown && (
                    <div className={`absolute bottom-full left-0 mb-2 w-48 rounded-2xl border shadow-lg z-10 ${isDark ? 'border-white/10 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => { imageInputRef.current?.click(); setShowUploadDropdown(false); }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Upload Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { fileInputRef.current?.click(); setShowUploadDropdown(false); }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span>Upload Document</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Textarea - Flexible width */}
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={isComposerLocked || isSending}
                    rows={1}
                    className={`w-full max-h-32 resize-none bg-transparent px-1 py-2 text-base focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      isDark ? 'text-slate-50 placeholder:text-slate-500' : 'text-slate-950 placeholder:text-slate-400'
                    }`}
                    aria-label="Message input"
                  />
                </div>

                {/* Model Selector - Desktop */}
                <button
                  type="button"
                  onClick={() => setShowModelModal(true)}
                  className={`flex h-10 flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors ${
                    isDark
                      ? 'border-slate-700 bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                  aria-label="Select model"
                >
                  <ProviderIcon provider={selectedModelObj?.provider || 'gemini'} color={selectedModelObj?.iconColor || '#4285F4'} size={16} />
                  <span className="whitespace-nowrap">{selectedModelObj?.name}</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Voice Input Button - Desktop */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (e.detail === 0) return;
                      if (isRecording) {
                        stopRecording();
                      } else {
                        setPreVoiceMessage(message.trim());
                        clearTranscript();
                        startRecording();
                        setTimeout(() => {
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }, 50);
                      }
                    }}
                    onKeyDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    disabled={isComposerLocked}
                    tabIndex={-1}
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : isDark
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    aria-label={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Send/Stop Button - Desktop */}
                <button
                  type={isActuallySending ? "button" : "submit"}
                  onClick={isActuallySending ? onStop : undefined}
                  disabled={!canSend && !isActuallySending}
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl transition-all ${
                    isActuallySending
                      ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                      : canSend
                        ? 'gradient-primary text-white hover:opacity-90'
                        : isDark
                          ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                          : 'cursor-not-allowed bg-slate-200 text-slate-400'
                  }`}
                  aria-label={isActuallySending ? "Stop generating" : "Send message"}
                >
                  {isActuallySending ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
