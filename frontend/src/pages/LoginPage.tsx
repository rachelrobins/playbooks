/**
 * Renders the login and registration page.
 * Handles authentication and enforces password-strength requirements during registration.
 */
import { FormEvent, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';
import { PasswordInput } from '../components/PasswordInput';
import { checkPasswordStrength, isPasswordStrongEnough } from '../utils/passwordStrength';

type Mode = 'login' | 'register';

// Renders the login/register page for the application. If the user is already logged in, they are redirected to the create playbook page.
export function LoginPage() {
  const { token, login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => checkPasswordStrength(password, [email]), [password, email]);
  const passwordTooWeak = mode === 'register' && password.length > 0 && !isPasswordStrongEnough(password, [email]);

  if (token) {
    return <Navigate to="/playbooks/new" replace />;
  }

  // Handle form submission for login or registration.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === 'register' && !isPasswordStrongEnough(password, [email])) {
      setError('Password is too weak or guessable. Try adding more unique words or characters.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/playbooks/new');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Playblocks</h1>
      <div className="auth-tabs">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Log In
        </button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            pattern={mode === 'register' ? '(?=.*[A-Za-z])(?=.*[0-9]).{8,}' : undefined}
            title={mode === 'register' ? 'At least 8 characters, including one letter and one number.' : undefined}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {mode === 'register' && (
          <p className={passwordTooWeak ? 'field-hint field-hint--warning' : 'field-hint'}>
            Must be at least 8 characters, include one letter and one number, and not be easily guessable.
            {password.length > 0 && passwordTooWeak && strength.feedback.warning
              ? ` ${strength.feedback.warning}`
              : ''}
          </p>
        )}

        <ErrorBanner message={error} />

        <button type="submit" disabled={submitting || passwordTooWeak}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
