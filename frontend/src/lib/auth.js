/**
 * Authentication utilities for AI Chatbot
 * Handles auth state management with cookie-based JWT
 */

/**
 * Checks if user is authenticated (client-side check)
 * In production, this would verify JWT token from cookie
 * @returns {boolean} Whether user is authenticated
 */
export function isAuthenticated() {
  // In production: Check if JWT cookie exists and is valid
  // For now, check localStorage/cookie for demo purposes
  if (typeof window === 'undefined') return false;
  const cookieMatch = document.cookie
    .split('; ')
    .find((row) => row.startsWith('isAuthenticated='));
  const cookieValue = cookieMatch?.split('=')[1];
  return localStorage.getItem('isAuthenticated') === 'true' || cookieValue === 'true';
}

/**
 * Sets authentication state (demo purposes only)
 * In production, the backend sets httpOnly cookie
 * @param {boolean} value - Auth state
 */
export function setAuthState(value) {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem('isAuthenticated', 'true');
    document.cookie = 'isAuthenticated=true; path=/; max-age=604800; samesite=lax';
  } else {
    localStorage.removeItem('isAuthenticated');
    document.cookie = 'isAuthenticated=; path=/; max-age=0; samesite=lax';
  }
}

/**
 * Gets redirect path after login
 * @returns {string} Redirect path
 */
export function getRedirectPath() {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || '/';
}

/**
 * Creates login redirect URL with return path
 * @param {string} returnPath - Path to return to after login
 * @returns {string} Login URL with redirect
 */
export function createLoginRedirect(returnPath = '/') {
  return `/login?redirect=${encodeURIComponent(returnPath)}`;
}
