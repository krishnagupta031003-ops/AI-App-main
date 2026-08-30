'use client';

/**
 * Reset Password Page
 * Allows users to reset their password with a token
 */

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import AuthForm from '../../../components/auth/AuthForm';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token') || '';
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState(
    token ? '' : 'Invalid reset link. Please request a new password reset.'
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!token) {
      setGeneralError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await resetPassword(token, formData.password);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setGeneralError(result.error || 'Failed to reset password. The link may be expired.');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthForm
        title="Password Reset Successful"
        description="Your password has been updated successfully."
        footer={<>Redirecting to sign in...</>}
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-slate-900 dark:text-slate-50">
              Your password has been successfully reset!
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              You can now sign in with your new password.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/login">
              <Button fullWidth>Go to sign in</Button>
            </Link>
          </div>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset Password"
      description="Create a new password."
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
        {generalError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <p className="text-sm text-rose-700 dark:text-rose-200">{generalError}</p>
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Create a new password"
          helperText="At least 6 characters"
          required
          disabled={loading || !token}
          autoFocus
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your new password"
          required
          disabled={loading || !token}
        />

        <button
          type="submit"
          disabled={loading || !token}
          className="gradient-primary text-white px-6 py-3 rounded-xl shadow-lg font-medium hover:opacity-90 transition w-full flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {loading ? 'Resetting...' : 'Reset password'}
        </button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            Request a new reset link
          </Link>
        </div>
      </form>
    </AuthForm>
  );
}
