import type { Metadata } from 'next';
import { CollectionTabs, PageIntro } from '@/components/Bits';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Shop candles',
  description: 'Seasonal pours, everyday candles, wax melts and gift sets, handcrafted in the 209.',
};

export default function ShopPage() {
  return (
    <>
      <PageIntro eyebrow="The shop" title="Candles for every moment">
        <p>Handcrafted seasonal pours, with everyday candles, wax melts and gift sets arriving at launch.</p>
      </PageIntro>
      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <CollectionTabs />
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 3} />
          ))}
        </div>
      </section>
    </>
  );
}
