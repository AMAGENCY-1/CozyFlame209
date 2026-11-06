import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CollectionTabs, PageIntro } from '@/components/Bits';
import { ProductCard } from '@/components/ProductCard';
import { collections, getCollection } from '@/lib/catalog';
import { getStoreProducts } from '@/lib/catalog-store';

type Params = { collection: string };

export function generateStaticParams(): Params[] {
  return collections.map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { collection } = await params;
  const c = getCollection(collection);
  return c ? { title: c.name, description: c.description } : {};
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { collection } = await params;
  const c = getCollection(collection);
  if (!c) notFound();
  const items = (await getStoreProducts()).filter((p) => p.collection === c.slug);

  return (
    <>
      <PageIntro eyebrow="Collection" title={c.name}>
        <p>{c.description}</p>
      </PageIntro>
      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <CollectionTabs active={c.slug} />
        {items.length > 0 ? (
          <div className="product-grid">
            {items.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">Arriving at launch</p>
            <h2>{c.name} are on their way</h2>
            <p>This collection opens with the full store. Join the list in the footer to hear first.</p>
            <Link href="/shop/seasonal" className="btn btn-outline">
              Shop seasonal candles
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
