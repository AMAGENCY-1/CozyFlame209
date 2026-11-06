import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToBag } from '@/components/AddToBag';
import { ProductCard } from '@/components/ProductCard';
import { PLACEHOLDER_IMAGE, getCollection, isPurchasable } from '@/lib/catalog';
import { getStoreProduct, getStoreProducts } from '@/lib/catalog-store';
import { formatPrice } from '@/lib/format';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return (await getStoreProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getStoreProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary || p.description.slice(0, 150),
    openGraph: p.image.src ? { images: [{ url: p.image.src, alt: p.image.alt }] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) notFound();
  const collection = getCollection(product.collection)!;
  const related = (await getStoreProducts()).filter((p) => p.slug !== product.slug).slice(0, 3);
  const available = isPurchasable(product);

  return (
    <>
      <section className="pdp">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/shop/${collection.slug}`}>{collection.name}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pdp-grid">
            <div className="pdp-media">
              <Image
                src={product.image.src || PLACEHOLDER_IMAGE}
                alt={product.image.alt}
                className={product.image.src ? undefined : 'placeholder-img'}
                unoptimized={product.image.src.startsWith('/uploads/')}
                width={1200}
                height={1500}
                sizes="(max-width: 860px) 92vw, 50vw"
                priority
              />
            </div>

            <div className="pdp-info">
              <p className="eyebrow">
                {[collection.name, product.style].filter(Boolean).join(' · ')}
              </p>
              <h1>{product.name}</h1>
              <p className="pdp-price price">{product.price !== null ? formatPrice(product.price) : 'Price coming soon'}</p>
              <p className="pdp-summary">{product.description}</p>

              {product.notes.length > 0 && (
                <div>
                  <p className="eyebrow" style={{ marginBottom: 10 }}>
                    Scent notes
                  </p>
                  <ul className="scent-notes">
                    {product.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.draftNote && <p className="draft-note">{product.draftNote}</p>}

              <AddToBag slug={product.slug} name={product.name} available={available} />

              <div className="accordion">
                <details open>
                  <summary>Pickup &amp; delivery</summary>
                  <div className="panel">
                    <p>
                      Choose pickup in the 209, local delivery or shipping within California in your bag. Options and fees
                      are confirmed at checkout.
                    </p>
                  </div>
                </details>
                <details>
                  <summary>Candle care</summary>
                  <div className="panel">
                    <ul>
                      <li>Burn within sight. Keep away from children, pets and anything that can catch fire.</li>
                      <li>On the first burn, let the wax melt all the way to the edge of the glass.</li>
                      <li>Trim the wick to about ¼ inch before each burn.</li>
                      <li>Stop burning when about ½ inch of wax remains.</li>
                    </ul>
                  </div>
                </details>
                <details>
                  <summary>Gifting</summary>
                  <div className="panel">
                    <p>Add gift wrap and a handwritten note in your bag before checkout.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" style={{ background: 'var(--paper)', paddingTop: 'clamp(48px, 6vw, 88px)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">You may also love</p>
                <h2>More from the shelf</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
