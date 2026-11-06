'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { BagIcon, CloseIcon, MenuIcon } from './icons';

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/custom-orders', label: 'Custom & Events' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/help', label: 'Help' },
];

export function Header() {
  const { count, open } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <button
          type="button"
          className="icon-button menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link href="/" className="brand" aria-label="The Cozy Flame, home">
          <Image src="/images/brand/logo-badge.png" alt="" width={44} height={44} priority />
          <span className="brand-name">The Cozy Flame</span>
        </Link>

        <nav className="main-nav" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button type="button" className="icon-button bag-button" onClick={open} aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}>
          <BagIcon />
          {count > 0 && <span className="bag-count">{count}</span>}
        </button>
      </div>

      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile" hidden={!menuOpen}>
        <div className="container">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
