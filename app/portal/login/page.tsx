import type { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/portal/LoginForm';
import { portalConfigured } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith('/portal') ? params.next : '/portal';

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
        <div className="login-card">
          <header>
            <p className="studio-eyebrow">Welcome back</p>
            <h2>Sign in to your studio</h2>
            <p>Add new candles, update prices and manage what&apos;s on your shelf.</p>
          </header>

          {params.signedOut && <p className="form-notice">You&apos;ve been signed out. See you soon.</p>}
          {!portalConfigured() && (
            <p className="form-notice">
              First time here? <a href="/portal/setup">Set up your studio password</a> to switch the studio on.
            </p>
          )}

          <LoginForm next={next} />

          <div className="login-foot">
            <a href="/">← Back to the store</a>
            <a href="/portal/setup">Set up or change your password</a>
          </div>
        </div>
      </main>
    </div>
  );
}
