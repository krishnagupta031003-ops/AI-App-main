"use client";

/**
 * Chat Context
 * Manages chat conversations and messages across the application
 */

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { chatAPI } from "../lib/api";
import { generateId } from "../lib/utils";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext(null);

const GUEST_CHAT_STORAGE_KEY = "chatarea_guest_chat_session";
const GUEST_CHAT_ID = "guest-session";

function getNow() {
    return new Date().toISOString();
}

function createGuestConversation(existing = null) {
    const now = getNow();

    return {
        id: GUEST_CHAT_ID,
        title: existing?.title || "Guest Chat",
        messages: existing?.messages || [],
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        isGuestSession: true,
    };
}

function readGuestChatSession() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(GUEST_CHAT_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const parsed = JSON.parse(raw);
        if (!parsed?.currentConversation) {
            return null;
        }

        const currentConversation = createGuestConversation(
            parsed.currentConversation,
        );

        return {
            currentConversation,
            conversations:
                Array.isArray(parsed.conversations) &&
                parsed.conversations.length > 0
                    ? parsed.conversations.map((conversation) =>
                          createGuestConversation(conversation),
                      )
                    : [currentConversation],
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        };
    } catch {
        return null;
    }
}

function writeGuestChatSession(session) {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.setItem(
        GUEST_CHAT_STORAGE_KEY,
        JSON.stringify(session),
    );
}

function clearGuestChatSession() {
    if (typeof window === "undefined") {
        return;
    }

    window.sessionStorage.removeItem(GUEST_CHAT_STORAGE_KEY);
}

export function ChatProvider({ children }) {
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [guestSessionReady, setGuestSessionReady] = useState(false);
    const abortControllerRef = useRef(null);

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setSending(false);
    };

    /**
     * Restore guest chat locally, or load account conversations when authenticated.
     */
    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            // Immediately clear authenticated state to prevent old chats from showing
            setConversations([]);
            setCurrentConversation(null);
            setMessages([]);

            // Then restore any saved guest session
            const guestSession = readGuestChatSession();
            if (guestSession) {
                setConversations(guestSession.conversations);
                setCurrentConversation(guestSession.currentConversation);
                setMessages(guestSession.messages);
            }

            setGuestSessionReady(true);
            return;
        }

        setGuestSessionReady(true);
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, isAuthenticated]);
    /**
     * Persist guest chat in the current browser session.
     */
    useEffect(() => {
        if (authLoading || isAuthenticated || !guestSessionReady) {
            return;
        }

        if (!currentConversation) {
            if (messages.length === 0) {
                clearGuestChatSession();
            }
            return;
        }

        // Prevent saving an authenticated chat as a guest session during logout transition
        if (
            currentConversation.id !== GUEST_CHAT_ID &&
            currentConversation.id !== undefined &&
            !currentConversation.id.toString().startsWith("temp-")
        ) {
            return;
        }

        const guestConversation = createGuestConversation({
            ...currentConversation,
            messages,
            updatedAt: getNow(),
        });

        writeGuestChatSession({
            currentConversation: guestConversation,
            conversations: [guestConversation],
            messages,
        });
    }, [
        authLoading,
        isAuthenticated,
        guestSessionReady,
        currentConversation,
        messages,
        conversations,
    ]);

    /**
     * Load all conversations
     */
    async function loadConversations() {
        try {
            setLoading(true);
            setError(null);

            const response = await chatAPI.getConversations();
            const backendConversations = Array.isArray(response.data)
                ? response.data
                : [];
            const guestSession = readGuestChatSession();

            if (guestSession?.currentConversation) {
                const mergedConversations = [
                    guestSession.currentConversation,
                    ...backendConversations.filter(
                        (conversation) => conversation.id !== GUEST_CHAT_ID,
                    ),
                ];

                setConversations(mergedConversations);
                setCurrentConversation(guestSession.currentConversation);
                setMessages(guestSession.messages);
                return;
            }

            setConversations(backendConversations);

            if (!currentConversation && backendConversations.length > 0) {
                const mostRecent = [...backendConversations].sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
                )[0];
                selectConversation(mostRecent.id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const loadMessages = async (conversationId, pageNumber = 1) => {
        try {
            const response = await chatAPI.getMessages(
                conversationId,
                pageNumber,
                limit,
            );

            const fetchedMessages = Array.isArray(response.data)
                ? response.data
                : response.data.messages || [];
            if (pageNumber === 1) {
                setMessages(fetchedMessages);
            } else {
                // prepend older messages
                setMessages((prev) => [...fetchedMessages, ...prev]);
            }

            setPage(pageNumber);

            if (response.data.totalPages) {
                setHasMore(pageNumber < response.data.totalPages);
            } else {
                setHasMore(fetchedMessages.length === limit);
            }
        } catch (err) {
            setError(err.message || "Failed to load messages");
        }
    };

    /**
     * Select and load a conversation
     */
    const selectConversation = async (conversationId) => {
        // Guest conversation
        if (conversationId === GUEST_CHAT_ID) {
            const guestSession = readGuestChatSession();

            if (guestSession?.currentConversation) {
                setCurrentConversation(guestSession.currentConversation);
                setMessages(guestSession.messages);
                return { success: true };
            }

            setError("Conversation not found");
            return { success: false, error: "Conversation not found" };
        }

        try {
            setLoading(true);
            setError(null);

            // Find conversation from state
            const conversation = conversations.find(
                (conv) => conv.id === conversationId,
            );

            if (!conversation) {
                throw new Error("Conversation not found");
            }

            // Set current conversation
            setCurrentConversation(conversation);

            // Reset pagination
            setPage(1);
            setHasMore(true);

            // Load first page of messages
            await loadMessages(conversationId, 1);

            return { success: true };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to load conversation";

            setError(errorMessage);
            setMessages([]);

            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a new conversation
     */
    const createConversation = async (title = "New Chat") => {
        try {
            setLoading(true);
            setError(null);

            const response = await chatAPI.createConversation(title);
            const newConversation = response.data;

            setConversations((prev) => [newConversation, ...prev]);
            setCurrentConversation(newConversation);
            setMessages([]);

            return { success: true, conversation: newConversation };
        } catch (err) {
            const errorMessage = err.message || "Failed to create conversation";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Send a message in the current conversation
     */
    const sendMessage = async (
        content,
        model = "gemini-2.5-flash",
        provider = "gemini",
        attachments = [],
    ) => {
        const isGuest = !isAuthenticated;
        let conversation = currentConversation;
        let conversationId = conversation?.id;

        if (!conversationId) {
            if (isGuest) {
                conversation = createGuestConversation();
                conversationId = conversation.id;
                setConversations([conversation]);
                setCurrentConversation(conversation);
                setMessages([]);
            } else {
                const result = await createConversation();
                if (!result.success) {
                    return result;
                }

                conversation = result.conversation;
                conversationId = result.conversation.id;
            }
        }

        const tempUserMessage = {
            id: generateId(),
            role: "user",
            content,
            attachments,
            timestamp: getNow(),
        };

        try {
            setSending(true);
            setError(null);
            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            const nextMessages = [...messages, tempUserMessage];
            setMessages(nextMessages);
            let response;

            if (isGuest) {
                // Guest: call no-auth route, pass history for context
                const guestHistory = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                response = await chatAPI.sendGuestMessage(
                    content,
                    provider,
                    model,
                    guestHistory,
                    attachments,
                    abortController.signal,
                );

                if (response.success && response.data?.assistantMessage) {
                    const aiMsg = {
                        id: generateId(),
                        role: "assistant",
                        content: response.data.assistantMessage.content,
                        timestamp: getNow(),
                    };

                    const finalMessages = [...nextMessages, aiMsg];
                    setMessages(finalMessages);

                    const updatedConversation = {
                        ...(conversation || createGuestConversation()),
                        id: conversationId,
                        title: conversation?.title || content.substring(0, 40),
                        updatedAt: getNow(),
                    };

                    const guestConversation =
                        createGuestConversation(updatedConversation);
                    const guestSession = {
                        currentConversation: guestConversation,
                        conversations: [guestConversation],
                        messages: finalMessages,
                    };

                    setCurrentConversation(guestConversation);
                    setConversations([guestConversation]);
                    writeGuestChatSession(guestSession);
                }

                return { success: true };
            }

            // Authenticated: call regular route
            response = await chatAPI.sendMessage(
                conversationId,
                content,
                provider,
                model,
                attachments,
                abortController.signal,
            );

            const finalMessages = response.data
                ? [
                      ...nextMessages.filter(
                          (message) => message.id !== tempUserMessage.id,
                      ),
                      response.data.userMessage,
                      response.data.assistantMessage,
                  ].filter(Boolean)
                : nextMessages;

            const backendChat = response.data?.chat;

            const updatedConversation = {
                ...(conversation || createGuestConversation()),
                id: backendChat ? backendChat.id : conversationId,
                title: backendChat
                    ? backendChat.title
                    : conversation?.title || "New Chat",
                updatedAt: getNow(),
            };

            setMessages(finalMessages);

            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId ? updatedConversation : conv,
                ),
            );
            setCurrentConversation(updatedConversation);

            return { success: true };
        } catch (err) {
            if (
                err.name === "CanceledError" ||
                err.name === "AbortError" ||
                err.message === "canceled"
            ) {
                // Ignored, user canceled the request
                return { success: false, error: "canceled" };
            }

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to send message";
            setError(errorMessage);
            setMessages((prev) =>
                prev.filter((m) => m.id !== tempUserMessage.id),
            );
            return { success: false, error: errorMessage };
        } finally {
            setSending(false);
            abortControllerRef.current = null;
        }
    };

    /**
     * Rename a conversation
     */
    const renameConversation = async (conversationId, newTitle) => {
        if (!newTitle || !newTitle.trim()) {
            return { success: false, error: "Title cannot be empty" };
        }

        if (conversationId === GUEST_CHAT_ID) {
            // Update guest session
            const guestSession = readGuestChatSession();
            if (guestSession?.currentConversation) {
                guestSession.currentConversation.title = newTitle.trim();
                writeGuestChatSession(guestSession);
                setCurrentConversation(guestSession.currentConversation);
            }
            return { success: true };
        }

        try {
            await chatAPI.renameConversation(conversationId, newTitle.trim());

            // Update local state
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === conversationId
                        ? { ...conv, title: newTitle.trim() }
                        : conv,
                ),
            );

            if (currentConversation?.id === conversationId) {
                setCurrentConversation((prev) => ({
                    ...prev,
                    title: newTitle.trim(),
                }));
            }

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    /**
     * Delete a conversation
     */
    const deleteConversation = async (conversationId) => {
        if (conversationId === GUEST_CHAT_ID) {
            clearGuestChatSession();
            setConversations([]);
            setCurrentConversation(null);
            setMessages([]);
            return { success: true };
        }

        try {
            setLoading(true);
            setError(null);

            await chatAPI.deleteConversation(conversationId);

            setConversations((prev) => {
                const remaining = prev.filter(
                    (conv) => conv.id !== conversationId,
                );

                if (currentConversation?.id === conversationId) {
                    setCurrentConversation(null);
                    setMessages([]);

                    if (remaining.length > 0) {
                        selectConversation(remaining[0].id);
                    }
                }

                return remaining;
            });

            return { success: true };
        } catch (err) {
            const errorMessage = err.message || "Failed to delete conversation";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear current conversation
     */
    const clearConversation = () => {
        if (!isAuthenticated) {
            clearGuestChatSession();
        }

        setCurrentConversation(null);
        setMessages([]);
    };

    const value = {
        conversations: isAuthenticated ? conversations : [],
        currentConversation,
        page,
        hasMore,
        loadMessages,
        messages,
        loading,
        sending,
        error,
        loadConversations,
        selectConversation,
        createConversation,
        renameConversation,
        clearConversation,
        sendMessage,
        stopGeneration,
        deleteConversation,
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}
