import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductRow } from '@/components/portal/ProductRow';
import { CandleIcon, ExternalIcon, PlusIcon } from '@/components/icons';
import { readCatalog } from '@/lib/catalog-store';

export const metadata: Metadata = { title: 'Overview' };

const dateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'America/Los_Angeles',
});
const updatedFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });

export default async function OverviewPage() {
  const { products, updatedAt } = await readCatalog();
  const count = (s: string) => products.filter((p) => p.status === s).length;
  const recent = [...products]
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, 5);

  return (
    <>
      <div className="s-head">
        <div>
          <p className="studio-eyebrow">{dateFormat.format(new Date())}</p>
          <h1>Welcome back</h1>
          <p className="lead">Here&apos;s everything on your shelf right now.</p>
        </div>
      </div>

      <section className="stat-grid" aria-label="Catalog at a glance">
        <div className="stat">
          <span className="stat-label">
            <span className="dot dot-live" /> Live
          </span>
          <span className="stat-value">{count('live')}</span>
          <span className="stat-note">On sale in your store</span>
        </div>
        <div className="stat">
          <span className="stat-label">
            <span className="dot dot-coming-soon" /> Coming soon
          </span>
          <span className="stat-value">{count('coming-soon')}</span>
          <span className="stat-note">Shown, not for sale yet</span>
        </div>
        <div className="stat">
          <span className="stat-label">
            <span className="dot dot-hidden" /> Hidden
          </span>
          <span className="stat-value">{count('hidden')}</span>
          <span className="stat-note">Saved, not on the store</span>
        </div>
        <div className="stat">
          <span className="stat-label">Last change</span>
          <span className="stat-value small">{updatedAt ? updatedFormat.format(new Date(updatedAt)) : 'None yet'}</span>
          <span className="stat-note">{updatedAt ? 'Your store is up to date' : 'Showing the starting catalog'}</span>
        </div>
      </section>

      <section className="quick-actions" aria-label="Quick actions">
        <Link href="/portal/products/new" className="quick-card primary">
          <span className="icon-wrap">
            <PlusIcon />
          </span>
          <span>
            <strong>Add a product</strong>
            <span>New candle, wax melt or gift set</span>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="quick-card">
          <span className="icon-wrap">
            <ExternalIcon />
          </span>
          <span>
            <strong>View your store</strong>
            <span>See it the way customers do</span>
          </span>
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <section className="s-panel" aria-labelledby="recent-title">
        <div className="s-panel-head">
          <h2 id="recent-title">Recently updated</h2>
          <Link href="/portal/products" className="s-btn s-btn-quiet">
            <CandleIcon width={16} height={16} /> All products
          </Link>
        </div>
        {recent.length ? (
          <ul className="product-list">
            {recent.map((p) => (
              <li key={p.slug}>
                <ProductRow product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="list-empty">
            <p>No products yet. Add your first candle to get started.</p>
          </div>
        )}
      </section>
    </>
  );
}
