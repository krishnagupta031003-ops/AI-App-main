'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import PhoneInput from '../ui/PhoneInput';
import Button from '../ui/Button';
import OAuthButtons from './OAuthButtons';
import { useAuth } from '../../hooks/useAuth';
import { useUiShell } from '../../hooks/useUiShell';
import { useTheme } from '../../contexts/ThemeContext';
import { isValidEmail } from '../../lib/utils';

const modeCopy = {
  login: {
    title: 'Sign in',
    description: 'Continue your conversations and keep your chat history in one place.',
  },
  signup: {
    title: 'Create account',
    description: 'Save your workspace and unlock unlimited chat.',
  },
  forgot: {
    title: 'Reset password',
    description: 'We will send a reset link to your email address.',
  },
  reset: {
    title: 'Set a new password',
    description: 'Paste the reset token from your email and choose a new password.',
  },
};

export default function AuthModal() {
  const { authModalMode, closeAuthModal, openAuthModal } = useUiShell();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Modal
      isOpen={!!authModalMode}
      onClose={closeAuthModal}
      size="lg"
      showCloseButton={false}
      tone={isDark ? 'dark' : 'light'}
      className={isDark ? 'border-white/10 bg-[#161B22]/95 backdrop-blur-2xl shadow-2xl shadow-black/50' : 'border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-xl'}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
              AgentX
            </p>
            <h3 className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {modeCopy[authModalMode]?.title || 'Sign in'}
            </h3>
            <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {modeCopy[authModalMode]?.description}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className={`rounded-2xl border p-2 transition-colors ${
              isDark
                ? 'border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Close authentication window"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {authModalMode === 'login' && (
          <LoginForm isDark={isDark} onSwitchMode={openAuthModal} onSuccess={closeAuthModal} />
        )}

        {authModalMode === 'signup' && (
          <SignupForm isDark={isDark} onSwitchMode={openAuthModal} onSuccess={closeAuthModal} />
        )}

        {authModalMode === 'forgot' && <ForgotForm isDark={isDark} onSwitchMode={openAuthModal} />}

        {authModalMode === 'reset' && <ResetForm isDark={isDark} onSwitchMode={openAuthModal} />}
      </div>
    </Modal>
  );
}

function LoginForm({ isDark, onSwitchMode, onSuccess }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleGitHubLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/github`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        onSuccess();
      } else {
        setGeneralError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && <InlineAlert isDark={isDark} tone="error" message={generalError} />}

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

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        required
        disabled={loading}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSwitchMode('forgot')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'
          }`}
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('signup')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Create account
        </button>
      </div>

      <Button type="submit" fullWidth loading={loading} disabled={loading}>
        Sign in
      </Button>

      <OAuthButtons
        onGoogleLogin={handleGoogleLogin}
        onGithubLogin={handleGitHubLogin}
      />
    </form>
  );
}

function SignupForm({ isDark, onSwitchMode, onSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleGoogleSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleGitHubSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${apiUrl}/auth/github`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter a valid phone number first' }));
      return;
    }
    setOtpSending(true);
    setGeneralError('');
    // Frontend-only mock for now, as requested
    setTimeout(() => {
      setOtpSent(true);
      setOtpSending(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    // No error message - just return if not 6 digits
    if (!formData.otp || formData.otp.length !== 6) {
      return;
    }
    setOtpVerifying(true);
    setGeneralError('');
    // Frontend-only mock for now, as requested
    setTimeout(() => {
      setOtpVerified(true);
      setOtpVerifying(false);
      setErrors((prev) => ({ ...prev, otp: '' }));
    }, 1000);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name) {
      nextErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      nextErrors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      nextErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      nextErrors.phone = 'Invalid phone number';
    }

    if (!otpVerified) {
      nextErrors.otp = 'Please verify your phone number';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        phone: formData.phone,
        password: formData.password,
      });
      if (result.success) {
        onSuccess();
      } else {
        setGeneralError(result.error || 'Signup failed. Please try again.');
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && <InlineAlert isDark={isDark} tone="error" message={generalError} />}

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

      <div className="space-y-2">
        <PhoneInput
          label="Phone Number"
          value={formData.phone}
          onChange={(phone) => {
             setFormData((prev) => ({ ...prev, phone }));
             setOtpSent(false);
             setOtpVerified(false);
          }}
          error={errors.phone}
          disabled={loading || otpVerified}
          required={true}
        />
        
        {!otpVerified && (
          <div className="flex gap-2 items-start mt-2">
            {!otpSent ? (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleSendOTP} 
                loading={otpSending}
                disabled={!formData.phone || formData.phone.length < 10}
                className="w-full sm:w-auto"
              >
                Send OTP
              </Button>
            ) : (
              <div className="flex flex-1 gap-2">
                <Input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  error={errors.otp}
                  placeholder="Enter 6-digit OTP"
                  disabled={loading || otpVerifying}
                  className="flex-1"
                  inputClassName="!py-2"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleVerifyOTP}
                  loading={otpVerifying}
                  disabled={!formData.otp || formData.otp.length !== 6}
                  className="mt-[2px]"
                >
                  Verify
                </Button>
              </div>
            )}
          </div>
        )}
        {otpVerified && (
           <p className="text-sm font-medium text-emerald-500 flex items-center gap-1.5 mt-1">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
             </svg>
             Phone number verified
           </p>
        )}
      </div>

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Create a password"
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

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Already have an account?
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('forgot')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'
          }`}
        >
          Reset password
        </button>
      </div>

      <Button type="submit" fullWidth loading={loading} disabled={loading || !otpVerified}>
        Create account
      </Button>

      <OAuthButtons
        onGoogleLogin={handleGoogleSignup}
        onGithubLogin={handleGitHubSignup}
      />
    </form>
  );
}

function ForgotForm({ isDark, onSwitchMode }) {
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
        setError(result.error || 'Failed to send reset email.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5">
        <InlineAlert
          isDark={isDark}
          tone="success"
          title="Check your email"
          message={`We sent a reset link to ${email}.`}
        />
        <Button fullWidth onClick={() => onSwitchMode('login')}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <InlineAlert isDark={isDark} tone="error" message={error} />}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError('');
        }}
        placeholder="you@example.com"
        required
        disabled={loading}
        autoFocus
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Back to sign in
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('signup')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'
          }`}
        >
          Create account
        </button>
      </div>

      <Button type="submit" fullWidth loading={loading} disabled={loading}>
        Send reset link
      </Button>
    </form>
  );
}

function ResetForm({ isDark, onSwitchMode }) {
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) setGeneralError('');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.token) {
      nextErrors.token = 'Reset token is required';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await resetPassword(formData.token, formData.password);
      if (result.success) {
        setSuccess(true);
      } else {
        setGeneralError(result.error || 'Failed to reset password.');
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-5">
        <InlineAlert
          isDark={isDark}
          tone="success"
          title="Password updated"
          message="Your password was reset successfully. You can now sign in."
        />
        <Button fullWidth onClick={() => onSwitchMode('login')}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && <InlineAlert isDark={isDark} tone="error" message={generalError} />}

      <Input
        label="Reset Token"
        type="text"
        name="token"
        value={formData.token}
        onChange={handleChange}
        error={errors.token}
        placeholder="Paste token from email"
        required
        disabled={loading}
      />

      <Input
        label="New Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Create a new password"
        required
        disabled={loading}
      />

      <Input
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
        disabled={loading}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onSwitchMode('forgot')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          Need a new link?
        </button>
        <button
          type="button"
          onClick={() => onSwitchMode('login')}
          className={`text-sm font-medium transition-colors ${
            isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-800'
          }`}
        >
          Back to sign in
        </button>
      </div>

      <Button type="submit" fullWidth loading={loading} disabled={loading}>
        Reset password
      </Button>
    </form>
  );
}

function InlineAlert({ isDark, tone, title, message }) {
  const palette =
    tone === 'success'
      ? isDark
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-50'
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : isDark
        ? 'border-rose-400/20 bg-rose-400/10 text-rose-50'
        : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <div className={`rounded-2xl border p-4 ${palette}`}>
      {title && <p className="text-sm font-semibold">{title}</p>}
      <p className={`text-sm leading-6 ${title ? 'mt-1' : ''}`}>{message}</p>
    </div>
  );
}
