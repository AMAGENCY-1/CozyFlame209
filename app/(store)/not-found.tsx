import Link from 'next/link';

export default function StoreNotFound() {
  return (
    <section className="page-intro" style={{ paddingBottom: 'var(--section)' }}>
      <div className="container">
        <p className="eyebrow">Page not found</p>
        <h1>This flame went out</h1>
        <p className="page-intro-text">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
        <Link href="/shop" className="btn btn-dark">
          Shop candles
        </Link>
      </div>
    </section>
  );
}
