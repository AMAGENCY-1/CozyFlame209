import Link from 'next/link';
import type { ReactNode } from 'react';
import { collections, type CollectionSlug } from '@/lib/catalog';

export function PreviewBanner() {
  return (
    <div className="preview-banner">
      <div className="container">
        Preview for client review · Product names, photos and copy are drafts · Checkout connects at launch
      </div>
    </div>
  );
}

export function CollectionTabs({ active }: { active?: CollectionSlug }) {
  return (
    <nav className="collection-tabs" aria-label="Collections">
      <Link href="/shop" aria-current={!active ? 'page' : undefined}>
        All
      </Link>
      {collections.map((c) => (
        <Link key={c.slug} href={`/shop/${c.slug}`} aria-current={active === c.slug ? 'page' : undefined}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="page-intro">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <div className="page-intro-text">{children}</div>}
      </div>
    </section>
  );
}

export function DraftChip({ children = 'Draft' }: { children?: ReactNode }) {
  return <span className="draft-chip">{children}</span>;
}
