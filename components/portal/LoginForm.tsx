'use client';

import { useActionState, useState } from 'react';
import { type LoginState, login } from '@/lib/portal-actions';
import { EyeIcon, EyeOffIcon, LockIcon } from '../icons';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  // Controlled so the username survives a failed attempt (React clears uncontrolled fields after submit).
  const [username, setUsername] = useState('');

  return (
    <form action={action} className="login-form">
      <input type="hidden" name="next" value={next} />

      {state.error && (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      )}

      <div className="s-field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          className="s-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={Boolean(state.error)}
        />
      </div>

      <div className="s-field">
        <label htmlFor="password">Password</label>
        <div className="password-wrap">
          <input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            className="s-input"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.error)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            {show ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
          </button>
        </div>
      </div>

      <button type="submit" className="s-btn s-btn-primary" disabled={pending} style={{ minHeight: 52 }}>
        {pending ? <span className="spinner" aria-hidden="true" /> : <LockIcon width={16} height={16} />}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
