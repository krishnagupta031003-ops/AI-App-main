"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { useUiShell } from "../../hooks/useUiShell";
import { useTheme } from "../../contexts/ThemeContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import Spinner from "../ui/Spinner";

export default function ChatArea() {
    const { user } = useAuth();
    const {
        messages,
        page,
        hasMore,
        loadMessages,
        currentConversation,
        sending,
        loading,
        sendMessage,
        stopGeneration,
        error,
    } = useChat();
    const { openAuthModal, guestLimitReached, recordGuestMessage } =
        useUiShell();
    const isGuest = !user;
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (content, model, provider, attachments) => {
        const result = await sendMessage(content, model, provider, attachments);

        if (result?.success && isGuest) {
            recordGuestMessage();
        }

        return result;
    };

    const handleScroll = async (e) => {
        if (!currentConversation || !hasMore) return;

        if (e.target.scrollTop < 50) {
            await loadMessages(currentConversation.id, page + 1);
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-transparent overflow-hidden">
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="min-h-0 flex-1 overflow-y-auto pb-4"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-4">
                        <div className="space-y-4 text-center">
                            <Spinner size="lg" className="text-cyan-400" />
                            <p className="text-sm text-slate-400">
                                Loading conversation...
                            </p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="mx-auto max-w-4xl">
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={message.id || message._id || index}
                                message={message}
                                userName={user?.name}
                            />
                        ))}

                        {sending && (
                            <div className="flex gap-4 px-4 py-6 sm:px-6 lg:px-8">
                                <div className="flex-shrink-0">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_24px_60px_rgba(6,182,212,0.24)]">
                                        <svg
                                            className="h-6 w-6 text-white animate-pulse"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-cyan-500 dark:text-cyan-400 text-sm font-semibold">
                                            AI Assistant
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                                                style={{
                                                    animationDelay: "0ms",
                                                }}
                                            />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                                                style={{
                                                    animationDelay: "150ms",
                                                }}
                                            />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                                                style={{
                                                    animationDelay: "300ms",
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            Thinking...
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={stopGeneration}
                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <svg
                                                className="h-3 w-3"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M6 6h12v12H6z" />
                                            </svg>
                                            Stop generating
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {error && (
                <div className="mx-4 mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500 border border-rose-500/20">
                    <div className="flex items-center gap-2">
                        <svg
                            className="h-5 w-5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="font-medium">
                            {typeof error === "string" &&
                            error.toLowerCase().includes("quota")
                                ? "You exceeded your current quota"
                                : typeof error === "string"
                                  ? error.split(",")[0].trim()
                                  : "Something went wrong. Please try again."}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex-shrink-0">
                <ChatInput
                    onSend={handleSendMessage}
                    disabled={sending || loading || guestLimitReached}
                    placeholder={
                        guestLimitReached
                            ? "Free messages ended for today. Sign in to continue."
                            : currentConversation
                              ? "Type your message..."
                              : "Start a new conversation..."
                    }
                    guestLimitReached={guestLimitReached}
                    onAuthRequest={openAuthModal}
                />
            </div>
        </div>
    );
}

function EmptyState() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-6 text-center sm:py-10">
            <div className="relative mb-6 sm:mb-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_24px_60px_rgba(6,182,212,0.24)] sm:h-24 sm:w-24 sm:rounded-[28px]">
                    <svg
                        className="h-10 w-10 text-white sm:h-12 sm:w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                </div>
                <div className="absolute -inset-5 -z-10 rounded-full bg-cyan-400/20 blur-3xl" />
            </div>

            <div className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
                <h1
                    className={`text-2xl font-semibold tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-950"}`}
                >
                    Welcome to AI Chatbot
                </h1>
                <p
                    className={`text-sm leading-6 sm:text-base sm:leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                    Start typing and the conversation begins here.
                </p>
            </div>

            <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <SuggestionCard
                    icon={<CodeIcon />}
                    title="Ask anything"
                    description="Get quick answers, ideas, and guidance."
                    isDark={isDark}
                />
                <SuggestionCard
                    icon={<BookIcon />}
                    title="Generate content"
                    description="Draft messages, outlines, or creative text."
                    isDark={isDark}
                />
                <SuggestionCard
                    icon={<SearchIcon />}
                    title="Plan work"
                    description="Break down tasks into practical next steps."
                    isDark={isDark}
                />
                <SuggestionCard
                    icon={<SparkIcon />}
                    title="Save your account"
                    description="Sign in from the top bar when you want a saved workspace."
                    isDark={isDark}
                />
            </div>
        </div>
    );
}

function SuggestionCard({ icon, title, description, isDark }) {
    return (
        <div
            className={`group rounded-3xl border p-5 text-left shadow-[0_18px_60px_rgba(2,6,23,0.15)] transition-all duration-200 ${
                isDark
                    ? "border-white/10 bg-white/5"
                    : "border-slate-200/80 bg-white"
            }`}
        >
            <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl transition-colors sm:h-12 sm:w-12 ${isDark ? "bg-white/10 text-cyan-300" : "bg-cyan-50 text-cyan-700"}`}
            >
                {icon}
            </div>
            <h3
                className={`mb-1.5 text-sm font-semibold sm:text-base ${isDark ? "text-white" : "text-slate-950"}`}
            >
                {title}
            </h3>
            <p
                className={`text-xs leading-5 sm:text-sm sm:leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
                {description}
            </p>
        </div>
    );
}

function CodeIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 9l-3 3 3 3M16 9l3 3-3 3M10 19l4-14"
            />
        </svg>
    );
}

function BookIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m6-10H8a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2z"
            />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
            />
        </svg>
    );
}

function SparkIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 3l2.4 5.2L21 10l-5.6 1.8L13 17l-2.4-5.2L5 10l5.6-1.8L13 3z"
            />
        </svg>
    );
}
