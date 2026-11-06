'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, EyeIcon, EyeOffIcon, LockIcon } from '../icons';

const ITERATIONS = 600_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Same format the server verifies: pbkdf2:<iterations>:<salt>:<hash>. Runs entirely in the browser. */
async function createStudioKey(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.normalize('NFKC')), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, material, 256);
  return ['pbkdf2', ITERATIONS, toBase64Url(salt), toBase64Url(new Uint8Array(bits))].join(':');
}

function strength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (pw.length < 12) return { score: 0, label: 'At least 12 characters' };
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (pw.length >= 16 && variety >= 3) return { score: 3, label: 'Strong' };
  if (pw.length >= 14 || variety >= 3) return { score: 2, label: 'Good' };
  return { score: 1, label: 'Okay. Longer is stronger.' };
}

export function PasswordSetup({ username, configured }: { username: string; configured: boolean }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const s = strength(password);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 12) return setError('Use at least 12 characters.');
    if (password !== confirm) return setError("The two passwords don't match.");
    if (!window.crypto?.subtle) return setError('This browser can’t create a secure key. Try Safari or Chrome.');
    setBusy(true);
    try {
      setKey(await createStudioKey(password));
      setPassword('');
      setConfirm('');
    } catch {
      setError('Something went wrong creating your key. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      (document.getElementById('studio-key') as HTMLTextAreaElement | null)?.select();
    }
  };

  if (key) {
    return (
      <div className="setup-result">
        <div className="form-notice" role="status">
          <strong>Your studio key is ready.</strong> Keep this page open until it&apos;s saved.
        </div>
        <div className="s-field">
          <label htmlFor="studio-key">Studio key</label>
          <textarea id="studio-key" className="s-textarea key-box" readOnly value={key} rows={3} onFocus={(e) => e.currentTarget.select()} />
          <button type="button" className="s-btn s-btn-primary" onClick={copy}>
            {copied ? <CheckIcon width={16} height={16} /> : <LockIcon width={16} height={16} />}
            {copied ? 'Copied' : 'Copy studio key'}
          </button>
        </div>

        <div className="setup-steps">
          <p className="s-label">Then switch it on</p>
          <ol>
            <li>
              Send the key to AMAGENCY, or add it yourself in <strong>Vercel → cozyflame209 → Settings → Environment Variables</strong>.
            </li>
            <li>
              Name: <code>PORTAL_PASSWORD_HASH</code>. Value: the key. Environments: Production and Preview.
            </li>
            <li>Save, then redeploy the latest deployment.</li>
            <li>
              Sign in with username <code>{username}</code> and the password you just chose.
            </li>
          </ol>
          <p className="field-hint">
            {configured
              ? 'Saving a new key signs out every device that was signed in.'
              : 'The key is safe to send: it can’t be turned back into your password.'}
          </p>
        </div>
        <button type="button" className="s-btn s-btn-quiet" onClick={() => setKey(null)}>
          Start over
        </button>
      </div>
    );
  }

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate>
      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}

      <div className="s-field">
        <label htmlFor="setup-username">Username</label>
        <input id="setup-username" className="s-input" value={username} readOnly autoComplete="username" />
      </div>

      <div className="s-field">
        <label htmlFor="new-password">New password</label>
        <div className="password-wrap">
          <input
            id="new-password"
            type={show ? 'text' : 'password'}
            className="s-input"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Hide passwords' : 'Show passwords'}
            aria-pressed={show}
          >
            {show ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
          </button>
        </div>
        <div className="strength" data-score={s.score} aria-live="polite">
          <span className="strength-bar">
            <i />
            <i />
            <i />
          </span>
          <span>{password ? s.label : 'At least 12 characters'}</span>
        </div>
      </div>

      <div className="s-field">
        <label htmlFor="confirm-password">Confirm password</label>
        <input
          id="confirm-password"
          type={show ? 'text' : 'password'}
          className="s-input"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="s-btn s-btn-primary" disabled={busy} style={{ minHeight: 52 }}>
        {busy ? <span className="spinner" aria-hidden="true" /> : <LockIcon width={16} height={16} />}
        {busy ? 'Creating your key…' : 'Create my studio key'}
      </button>
    </form>
  );
}
