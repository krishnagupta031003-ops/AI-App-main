'use client';

/**
 * Forgot Password Page
 * Allows users to request a password reset email
 */

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import AuthForm from '../../../components/auth/AuthForm';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { isValidEmail } from '../../../lib/utils';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthForm
        title="Check Your Email"
        description="We have sent a reset link."
        footer={
          <>
            Didn&apos;t receive the email?{' '}
            <button onClick={() => setSuccess(false)} className="font-semibold text-sky-600 hover:text-sky-700">
              Try again
            </button>
          </>
        }
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-slate-900 dark:text-slate-50">
              We&apos;ve sent a password reset link to:
            </p>
            <p className="font-medium text-slate-950 dark:text-white">{email}</p>
          </div>

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>

          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" fullWidth>
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Forgot Password?"
      description="Enter your email to get a reset link."
      footer={
        <>
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="you@example.com"
          required
          disabled={loading}
          autoFocus
        />

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition w-full flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthForm>
  );
}
