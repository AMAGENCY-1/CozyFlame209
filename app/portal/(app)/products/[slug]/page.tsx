import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductEditor } from '@/components/portal/ProductEditor';
import { readCatalog } from '@/lib/catalog-store';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await readCatalog()).products.find((p) => p.slug === slug);
  return { title: product ? product.name : 'Product' };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = (await readCatalog()).products.find((p) => p.slug === slug);
  if (!product) notFound();

  const notice = query.saved
    ? product.status === 'hidden'
      ? 'Saved. This product is hidden from the store.'
      : 'Saved. Your store is updated.'
    : query.error === 'delete'
      ? 'Could not delete this product. Please try again.'
      : null;

  // `key` resets the editor when switching between products.
  return <ProductEditor key={product.slug} product={product} notice={notice} />;
}
