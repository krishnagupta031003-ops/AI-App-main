import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important: Send cookies with requests
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Don't log or process cancellation errors - they're expected when user stops generation
    if (axios.isCancel(error)) {
      throw error;
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAuthenticated');
        document.cookie = 'isAuthenticated=; path=/; max-age=0; samesite=lax';
      }
    }

    // Extract a human-readable message from the backend response — never expose HTTP status codes
    const responseData = error.response?.data;
    let message =
      responseData?.error?.message ||   // nested error object
      responseData?.message ||           // top-level message field
      responseData?.error ||             // error as plain string
      (typeof responseData === 'string' ? responseData : null) ||
      error.message ||
      'Something went wrong. Please try again.';

    if (typeof message === 'string') {
      // Sometimes AI providers return a stringified JSON inside the error message
      try {
        const parsed = JSON.parse(message);
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        }
      } catch (e) {
        // Not JSON, ignore
      }

      if (
        message.includes('429') ||
        message.includes('Quota exceeded') ||
        message.includes('rate limit') ||
        message.includes('RESOURCE_EXHAUSTED')
      ) {
        message = 'You have exceeded the API rate limit. Please try again later.';
      }
    }

    // Only log non-401 and non-499 errors (401 is expected when not authenticated, 499 is user abort)
    if (error.response?.status !== 401 && error.response?.status !== 499) {
      console.error('API Error:', message, error.response?.status);
    }

    // Preserve status code in thrown error so handlers can check it
    const apiError = new Error(message);
    apiError.status = error.response?.status;
    apiError.response = error.response;
    throw apiError;
  }
);

/**
 * Auth API
 */
export const authAPI = {
    // Register new user
    async register(userData) {
        return apiClient.post("/auth/register", userData);
    },

    // Login user
    async login(credentials) {
        return apiClient.post("/auth/login", credentials);
    },

    // Logout user
    async logout() {
        return apiClient.post("/auth/logout");
    },

    // Get current user profile
    async getProfile() {
        return apiClient.get("/auth/me");
    },

    // Request password reset
    async forgotPassword(email) {
        return apiClient.post("/auth/forgot-password", { email });
    },

    // Reset password with token
    async resetPassword(token, newPassword) {
        return apiClient.post("/auth/reset-password", {
            token,
            password: newPassword,
        });
    },

    // Request OTP for profile actions
    async requestOTP(purpose) {
        return apiClient.post("/auth/request-otp", { purpose });
    },

    // Verify OTP
    async verifyOTP(purpose, otp) {
        return apiClient.post("/auth/verify-otp", { purpose, otp });
    },

    // Update profile
    async updateProfile(updates) {
        return apiClient.put("/auth/profile", updates);
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        return apiClient.put("/auth/password", {
            currentPassword,
            newPassword,
        });
    },

    // Delete account
    async deleteAccount() {
        return apiClient.delete("/auth/account");
    },
};

/**
 * Chat API
 */
export const chatAPI = {
    // Get all chat conversations
    async getConversations() {
        const response = await apiClient.get("/chats");
        if (response.data) {
            response.data = response.data.map((c) => ({
                ...c,
                id: c._id || c.id,
            }));
        }
        return response;
    },

    // Get single conversation with messages
    async getConversation(conversationId) {
        const response = await apiClient.get("/chats/" + conversationId);
        if (response.data) {
            response.data.id = response.data._id || response.data.id;
        }
        return response;
    },

    // Get single conversation with messages
    async getMessages(chatId, page = 1, limit = 20) {
        return await apiClient.get(
            `/messages/${chatId}?page=${page}&limit=${limit}`,
        );
    },

    // Create new conversation
    async createConversation(title = "New Chat") {
        // The backend does not have a standalone route to create a chat without sending a message.
        // It creates it automatically on the first message sent.
        // So we return a local mock conversation.
        return {
            success: true,
            data: {
                id: `temp-${Date.now()}`,
                title,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    },

    // Send message in conversation
    async sendMessage(
        conversationId,
        message,
        provider = "gemini",
        model = "gemini-2.5-flash",
        attachments = [],
        abortSignal = null,
    ) {
        const isTemp =
            conversationId && conversationId.toString().startsWith("temp-");

        const payload = {
            message,
            model,
            provider,
        };

        if (attachments && attachments.length > 0) {
            payload.attachments = attachments;
        }

        // Only pass chatId if it's an existing backend chat
        if (conversationId && !isTemp && conversationId !== "guest-session") {
            payload.chatId = conversationId;
        }

        const response = await apiClient.post("/messages", payload, {
            signal: abortSignal,
        });

        if (response.success && response.data) {
            const { chat, userMessage, assistantMessage } = response.data;

            return {
                success: true,
                data: {
                    chat: chat ? { ...chat, id: chat._id } : null,
                    userMessage: userMessage
                        ? {
                              id: userMessage._id,
                              role: userMessage.role,
                              content: userMessage.content,
                              attachments: userMessage.attachments || [],
                              timestamp: userMessage.createdAt,
                          }
                        : null,
                    assistantMessage: assistantMessage
                        ? {
                              id: assistantMessage._id,
                              role: assistantMessage.role,
                              content: assistantMessage.content,
                              model: assistantMessage.model || model, // Add model
                              provider: assistantMessage.provider || provider, // Add provider
                              timestamp: assistantMessage.createdAt,
                          }
                        : null,
                },
            };
        }

        return response;
    },

    // Send guest message (no auth, no DB save)
    async sendGuestMessage(
        message,
        provider = "gemini",
        model = "gemini-2.5-flash",
        history = [],
        attachments = [],
        abortSignal = null,
    ) {
        const payload = {
            message,
            model,
            provider,
            history,
        };
        if (attachments && attachments.length > 0) {
            payload.attachments = attachments;
        }
        const response = await apiClient.post("/messages/guest", payload, {
            signal: abortSignal,
        });
        return response;
    },

    // Delete conversation
    async deleteConversation(conversationId) {
        const response = await apiClient.delete(`/chats/${conversationId}`);
        return response.success;
    },

    // Rename conversation
    async renameConversation(conversationId, title) {
        const response = await apiClient.patch(
            `/chats/${conversationId}/rename`,
            { title },
        );
        return response;
    },

    // Upload files to backend
    async uploadFiles(files) {
        if (!files || files.length === 0) return [];

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        // Make request using standard fetch or axios. We'll use apiClient.post but ensure headers are correct for FormData
        const response = await apiClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.success) {
            return response.data; // Array of { name, type, size, url }
        }
        throw new Error(response.message || "Failed to upload files");
    },
};

/**
 * User API
 */
export const userAPI = {
    // Update user profile
    async updateProfile(updates) {
        return apiClient.put("/auth/profile", updates);
    },

    // Get subscription info
    async getSubscription() {
        return apiClient.get("/subscriptions/me");
    },
};

/**
 * Subscription API
 */
export const subscriptionAPI = {
    // Get all subscription plans
    async getPlans() {
        return apiClient.get("/subscriptions/plans");
    },

    // Get user's current subscription
    async getUserSubscription() {
        return apiClient.get("/subscriptions/me");
    },

    // Get payment history
    async getPaymentHistory() {
        return apiClient.get("/subscriptions/history");
    },

    // Create Razorpay order
    async createOrder(planId) {
        return apiClient.post("/subscriptions/razorpay/order", { planId });
    },

    // Verify Razorpay payment
    async verifyPayment(paymentData) {
        return apiClient.post("/subscriptions/razorpay/verify", paymentData);
    },

    // Cancel subscription
    async cancelSubscription() {
        return apiClient.post("/subscriptions/cancel");
    },

    // Reactivate subscription
    async reactivateSubscription(planId) {
        return apiClient.post("/subscriptions/reactivate", { planId });
    },
};
