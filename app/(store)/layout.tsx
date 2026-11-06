import type { ReactNode } from 'react';
import { PreviewBanner } from '@/components/Bits';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider, type CartProduct } from '@/components/CartProvider';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { getStoreProducts } from '@/lib/catalog-store';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const products = await getStoreProducts();
  // The bag only needs a few fields per product.
  const catalog: CartProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.status === 'live' ? p.price : null,
    notes: p.notes,
    image: p.image.src,
  }));

  return (
    <CartProvider catalog={catalog}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <PreviewBanner />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
