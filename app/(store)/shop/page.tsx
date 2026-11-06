import type { Metadata } from 'next';
import { CollectionTabs, PageIntro } from '@/components/Bits';
import { ProductCard } from '@/components/ProductCard';
import { getStoreProducts } from '@/lib/catalog-store';

export const metadata: Metadata = {
  title: 'Shop candles',
  description: 'Seasonal pours, everyday candles, wax melts and gift sets, handcrafted in the 209.',
};

export default async function ShopPage() {
  const products = await getStoreProducts();
  return (
    <>
      <PageIntro eyebrow="The shop" title="Candles for every moment">
        <p>Handcrafted seasonal pours, with everyday candles, wax melts and gift sets arriving at launch.</p>
      </PageIntro>
      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <CollectionTabs />
        {products.length > 0 ? (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">Restocking</p>
            <h2>New candles are on the way</h2>
            <p>Join the list in the footer to hear the moment they arrive.</p>
          </div>
        )}
      </section>
    </>
  );
}
