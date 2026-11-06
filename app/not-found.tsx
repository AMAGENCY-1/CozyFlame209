import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-intro" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="container">
        <Image src="/images/brand/logo-badge.png" alt="The Cozy Flame" width={96} height={96} style={{ borderRadius: '50%' }} />
        <p className="eyebrow">Page not found</p>
        <h1>This flame went out</h1>
        <p className="page-intro-text">The page you&apos;re looking for has moved or doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-dark">
          Back to the store
        </Link>
      </div>
    </section>
  );
}
