'use client';

/**
 * Signup Page
 * Allows new users to create an account
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import AuthForm from '../../../components/auth/AuthForm';
import OAuthButtons from '../../../components/auth/OAuthButtons';
import Input from '../../../components/ui/Input';
import PhoneInput from '../../../components/ui/PhoneInput';
import Button from '../../../components/ui/Button';
import { isValidEmail } from '../../../lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

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

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        router.push('/');
      } else {
        setGeneralError(result.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleGitHubSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/github`;
  };

  return (
    <AuthForm
      title="Create Account"
      description="Create your account and get started."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {generalError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
            <p className="text-sm text-rose-700 dark:text-rose-200">{generalError}</p>
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="John Doe"
          required
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          required
          disabled={loading}
        />

        <PhoneInput
          label="Phone Number (Optional)"
          value={formData.phone}
          onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          error={errors.phone}
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Create a strong password"
          helperText="At least 6 characters"
          required
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary text-white px-6 py-2.5 rounded-xl shadow-lg font-medium hover:opacity-90 transition w-full flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <OAuthButtons
          onGoogleLogin={handleGoogleSignup}
          onGithubLogin={handleGitHubSignup}
        />

        <p className="text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
          By signing up, you agree to our{' '}
          <a href="#" className="font-medium text-sky-600 hover:text-sky-700">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-sky-600 hover:text-sky-700">
            Privacy Policy
          </a>
        </p>
      </form>
    </AuthForm>
  );
}
