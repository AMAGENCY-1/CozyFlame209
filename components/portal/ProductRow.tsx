import Link from 'next/link';
import { type Product, getCollection } from '@/lib/catalog';
import { formatPrice, formatUpdated } from '@/lib/format';
import { ImageIcon } from '../icons';
import { StatusPill } from './ui';

export function ProductRow({ product }: { product: Product }) {
  const collection = getCollection(product.collection)?.name ?? '';
  return (
    <Link href={`/portal/products/${product.slug}`} className="product-row">
      {product.image.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="thumb" src={product.image.src} alt="" loading="lazy" />
      ) : (
        <span className="thumb empty" aria-hidden="true">
          <ImageIcon width={20} height={20} />
        </span>
      )}
      <span className="row-name">
        <strong>{product.name}</strong>
        <span>{[collection, product.style].filter(Boolean).join(' · ')}</span>
      </span>
      <span className="row-price">{product.price === null ? 'TBA' : formatPrice(product.price)}</span>
      <span className="row-status">
        <StatusPill status={product.status} />
      </span>
      <span className="row-meta">{product.updatedAt ? `Updated ${formatUpdated(product.updatedAt)}` : 'Starting catalog'}</span>
      <span className="row-chevron" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
