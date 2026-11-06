import type { Metadata } from 'next';
import Image from 'next/image';
import { PasswordSetup } from '@/components/portal/PasswordSetup';
import { portalConfigured, portalUsername } from '@/lib/auth';

export const metadata: Metadata = { title: 'Set up your password' };
export const dynamic = 'force-dynamic';

export default function SetupPage() {
  const configured = portalConfigured();

  return (
    <div className="login">
      <aside className="login-art">
        <div className="login-art-inner">
          <Image src="/images/brand/logo-badge.png" alt="The Cozy Flame logo" width={176} height={176} priority />
          <p className="studio-eyebrow">Client studio</p>
          <h1>The Cozy Flame</h1>
          <p className="tagline">Small candles. Big moments.</p>
        </div>
        <p className="login-credit">Crafted by AMAGENCY</p>
      </aside>

      <main className="login-panel">
        <div className="login-card setup-card">
          <header>
            <p className="studio-eyebrow">{configured ? 'Change password' : 'One-time setup'}</p>
            <h2>{configured ? 'Choose a new password' : 'Set up your studio password'}</h2>
            <p>
              Your password never leaves this device. We turn it into a one-way studio key that can&apos;t be reversed,
              and only that key is saved.
            </p>
          </header>

          <PasswordSetup username={portalUsername()} configured={configured} />

          <div className="login-foot">
            <a href="/portal/login">← Back to sign in</a>
            <a href="/">Visit the store</a>
          </div>
        </div>
      </main>
    </div>
  );
}
