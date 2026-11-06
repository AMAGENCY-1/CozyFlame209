'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { logout } from '@/lib/portal-actions';
import { CandleIcon, ExternalIcon, GridIcon, PlusIcon, SignOutIcon } from '../icons';

const nav = [
  { href: '/portal', label: 'Overview', icon: GridIcon, exact: true },
  { href: '/portal/products', label: 'Products', icon: CandleIcon, exact: false },
  { href: '/portal/products/new', label: 'Add product', icon: PlusIcon, exact: true },
];

export function PortalShell({ username, storageWarning, children }: { username: string; storageWarning: boolean; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || (pathname.startsWith(`${href}/`) && pathname !== '/portal/products/new');

  const brand = (
    <Link href="/portal" className="studio-brand" aria-label="Studio overview">
      <Image src="/images/brand/logo-badge.png" alt="" width={44} height={44} priority />
      <div>
        <strong>The Cozy Flame</strong>
        <span>Client studio</span>
      </div>
    </Link>
  );

  return (
    <div className="studio">
      <aside className="studio-side">
        {brand}
        <nav className="studio-nav" aria-label="Studio">
          {nav.map(({ href, label, icon: Icon, exact }) => (
            <Link key={href} href={href} aria-current={isActive(href, exact) ? 'page' : undefined}>
              <Icon width={20} height={20} /> {label}
            </Link>
          ))}
          <div className="nav-sep" />
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalIcon width={20} height={20} /> View your store
          </a>
        </nav>
        <div className="studio-user">
          <p>
            Signed in as <strong>{username}</strong>
          </p>
          <form action={logout}>
            <button type="submit" className="signout">
              <SignOutIcon width={18} height={18} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="studio-topbar">
        <div className="studio-topbar-row">
          {brand}
          <form action={logout}>
            <button type="submit" className="signout" aria-label="Sign out">
              <SignOutIcon width={20} height={20} />
            </button>
          </form>
        </div>
        <nav className="studio-tabs" aria-label="Studio">
          {nav.map(({ href, label, exact }) => (
            <Link key={href} href={href} aria-current={isActive(href, exact) ? 'page' : undefined}>
              {label}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer">
            View store ↗
          </a>
        </nav>
      </header>

      <main className="studio-main">
        <div className="studio-inner">
          {storageWarning && (
            <p className="storage-warning" role="status">
              Saving is paused because product storage isn&apos;t connected yet. Please contact AMAGENCY.
            </p>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
