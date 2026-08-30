'use client';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { isAuthenticated, setAuthState } from '../lib/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated and load profile
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always check with backend - it verifies the httpOnly token cookie
      const response = await authAPI.getProfile();
      setUser(response.data);
      setAuthState(true);
    } catch (err) {
      // 401 errors are expected when not authenticated (after logout or session expiry)
      // Only log unexpected errors
     if (err.status !== 401 && err.response?.status !== 401) {
        console.error('Auth check failed:', err);
      }
      setAuthState(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);
      setUser(response.user);
      setAuthState(true);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      setUser(response.user);
      setAuthState(true);

      return { success: true, user: response.user };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.logout();
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('chatarea_guest_chat_session');
      }
      setUser(null);
      setAuthState(false);

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request password reset
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.forgotPassword(email);
      return { success: true, message: 'Password reset email sent' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      await authAPI.resetPassword(token, newPassword);
      return { success: true, message: 'Password reset successful' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const { userAPI } = await import('../lib/api');
      const response = await userAPI.updateProfile(updates);
      setUser(response.data);

      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
