import Image from 'next/image';
import Link from 'next/link';
import { collections } from '@/lib/catalog';
import { site } from '@/lib/format';
import { NewsletterForm } from './Forms';
import { InstagramIcon } from './icons';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/brand/logo-badge.png" alt="The Cozy Flame logo" width={96} height={96} />
          <p className="footer-tagline">{site.tagline}</p>
          <p className="footer-small">Handcrafted candles from California's 209.</p>
        </div>

        <nav className="footer-col" aria-label="Shop">
          <h2>Shop</h2>
          <Link href="/shop">All candles</Link>
          {collections.map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>

        <nav className="footer-col" aria-label="The Cozy Flame">
          <h2>The Cozy Flame</h2>
          <Link href="/our-story">Our story</Link>
          <Link href="/custom-orders">Custom &amp; events</Link>
          <Link href="/help#pickup">Pickup &amp; delivery</Link>
          <Link href="/help#care">Candle care</Link>
          <Link href="/help#contact">Contact</Link>
        </nav>

        <div className="footer-col footer-news">
          <h2>Seasonal drops, first</h2>
          <p>New scents and holiday releases, straight to your inbox.</p>
          <NewsletterForm />
          <a className="footer-ig" href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            <InstagramIcon width={18} height={18} /> {site.instagramHandle}
          </a>
        </div>
      </div>
      <div className="container footer-base">
        <span>© 2026 The Cozy Flame</span>
        <span>Site by AMAGENCY</span>
      </div>
    </footer>
  );
}
