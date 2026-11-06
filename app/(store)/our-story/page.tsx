import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DraftChip } from '@/components/Bits';

export const metadata: Metadata = {
  title: 'Our story',
  description: "The Cozy Flame makes handcrafted candles in California's 209. Small candles. Big moments.",
};

export default function OurStoryPage() {
  return (
    <>
      <section className="section">
        <div className="container split">
          <div className="split-media" style={{ borderRadius: '999px 999px 2px 2px', background: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
            <Image
              src="/images/brand/logo-badge-1000.png"
              alt="The Cozy Flame logo: a gold flame over a heart, framed by pink roses."
              width={1000}
              height={1000}
              sizes="(max-width: 860px) 80vw, 40vw"
              style={{ width: '78%', height: 'auto', objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="split-copy">
            <p className="eyebrow">Our story</p>
            <h1 style={{ fontSize: 'var(--step-4)' }}>Small candles. Big moments.</h1>
            <div className="prose">
              <p className="lede">
                The Cozy Flame makes handcrafted candles in California&apos;s Central Valley, the 209.
              </p>
              <p>
                The idea is simple: a small candle can hold a big moment. A quiet evening at home, a table set for the
                holidays, a gift that says you thought of someone.
              </p>
              <p>
                Every candle is made by hand, from the first pour to the last molded leaf, to bring comfort and an
                inclusive warmth to every space, whoever gathers around it.
              </p>
            </div>
            <p>
              <DraftChip>Founder&apos;s story coming from the client</DraftChip>
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper)' }}>
        <div className="container">
          <div className="values">
            <article>
              <p className="eyebrow">Made by hand</p>
              <h3>Shaped, not stamped</h3>
              <p>Whipped toppings and molded details are finished one candle at a time, so each has its own character.</p>
            </article>
            <article>
              <p className="eyebrow">Made for moments</p>
              <h3>From Tuesday nights to wedding days</h3>
              <p>Everyday glow, seasonal releases and custom pieces for the days you&apos;ll remember.</p>
            </article>
            <article>
              <p className="eyebrow">Made for everyone</p>
              <h3>Warmth without exception</h3>
              <p>An inclusive warmth for every space and everyone in it. That&apos;s the promise in every jar.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container" style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
          <h2 style={{ fontSize: 'var(--step-3)' }}>Find your flame</h2>
          <Link href="/shop" className="btn btn-dark">
            Shop candles
          </Link>
        </div>
      </section>
    </>
  );
}
