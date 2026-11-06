import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductTable } from '@/components/portal/ProductTable';
import { PlusIcon } from '@/components/icons';
import { readCatalog } from '@/lib/catalog-store';

export const metadata: Metadata = { title: 'Products' };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ products }, params] = await Promise.all([readCatalog(), searchParams]);

  return (
    <>
      <div className="s-head">
        <div>
          <p className="studio-eyebrow">Your shelf</p>
          <h1>Products</h1>
          <p className="lead">
            {products.length} {products.length === 1 ? 'product' : 'products'}. Tap any one to edit it.
          </p>
        </div>
        <div className="s-head-actions">
          <Link href="/portal/products/new" className="s-btn s-btn-primary">
            <PlusIcon width={16} height={16} /> Add product
          </Link>
        </div>
      </div>
      <ProductTable products={products} deletedName={params.deleted ?? null} />
    </>
  );
}
