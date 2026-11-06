import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <div className="product-card-media">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            width={1200}
            height={1500}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
            priority={priority}
          />
          <span className="tag">{product.price === null ? 'Coming soon' : product.style}</span>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          <p className="notes">{product.notes.length ? product.notes.join(' · ') : 'Scent announced soon'}</p>
          <p className="price">{product.price === null ? 'Holiday release' : formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
