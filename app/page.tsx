import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { ArrowIcon, FlameIcon, InstagramIcon } from '@/components/icons';
import { getProduct, products } from '@/lib/catalog';
import { formatPrice, site } from '@/lib/format';

export default function HomePage() {
  const hero = getProduct('lavender-in-bloom')!;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Handcrafted in California&apos;s 209</p>
            <h1>
              Small candles. <em>Big moments.</em>
            </h1>
            <p className="hero-lead">
              Dessert-inspired candles and seasonal scents, made by hand to bring comfort and warmth to every space.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-dark">
                Shop candles
              </Link>
              <Link href="/custom-orders" className="btn btn-outline">
                Plan a custom order
              </Link>
            </div>
          </div>

          <div className="hero-media">
            <div className="arch">
              <Image
                src={hero.image.src}
                alt={hero.image.alt}
                width={1200}
                height={1500}
                sizes="(max-width: 860px) 90vw, 470px"
                priority
              />
            </div>
            <Link href={`/products/${hero.slug}`} className="hero-caption">
              <strong>{hero.name}</strong>
              <span>
                {hero.notes.join(', ')} · {hero.price !== null && formatPrice(hero.price)}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="promise" aria-label="Why The Cozy Flame">
        <ul className="container">
          <li>
            <FlameIcon width={18} height={18} /> Handcrafted in the 209
          </li>
          <li>
            <FlameIcon width={18} height={18} /> Local pickup &amp; delivery
          </li>
          <li>
            <FlameIcon width={18} height={18} /> Gift wrap &amp; handwritten notes
          </li>
        </ul>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">The fall pours</p>
              <h2>This season&apos;s candles</h2>
            </div>
            <Link href="/shop" className="text-link">
              Shop all <ArrowIcon />
            </Link>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper)' }}>
        <div className="container split">
          <div className="split-media">
            <Image
              src="/images/products/holiday-whipped-mug.jpg"
              alt="A whipped candle in a glass mug, topped with piped white wax and molded trees."
              width={1200}
              height={1500}
              sizes="(max-width: 860px) 90vw, 45vw"
            />
          </div>
          <div className="split-copy">
            <p className="eyebrow">Our signature</p>
            <h2>Whipped, molded and finished by hand</h2>
            <p>
              Our whipped candles are crowned with soft peaks of wax and tiny molded details: pumpkins, leaves, evergreen
              trees. Each one is shaped by hand, so no two are exactly alike.
            </p>
            <ul className="detail-list">
              <li>
                <strong>Topping</strong>
                <span>Whipped wax, shaped by hand</span>
              </li>
              <li>
                <strong>Details</strong>
                <span>Molded pumpkins, leaves and trees</span>
              </li>
              <li>
                <strong>Vessels</strong>
                <span>Glass mugs, tumblers and jars</span>
              </li>
            </ul>
            <Link href="/shop/seasonal" className="text-link">
              See the seasonal collection <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="section band-dark">
        <div className="container band-grid">
          <div className="band-copy">
            <p className="eyebrow">Custom &amp; events</p>
            <h2>Big moments, made to order</h2>
            <p>
              Candles in your colors and scents for the days you&apos;ll remember: favors for every guest, centerpieces for
              the table, or gifts with your name on them.
            </p>
            <Link href="/custom-orders" className="btn btn-light">
              Start an inquiry
            </Link>
          </div>
          <ul className="occasions" aria-label="Occasions">
            <li>Weddings</li>
            <li>Baby showers</li>
            <li>Quinceañeras</li>
            <li>Birthdays</li>
            <li>Bridal showers</li>
            <li>Corporate gifts</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="story-teaser">
            <Image src="/images/brand/logo-badge.png" alt="The Cozy Flame logo" width={220} height={220} />
            <div className="copy">
              <p className="eyebrow">Rooted in the 209</p>
              <h2>Warmth for every space, and everyone in it</h2>
              <p>
                The Cozy Flame is a small candle studio in California&apos;s Central Valley. Every candle is handcrafted to
                bring comfort and an inclusive warmth to every space, whoever gathers around it.
              </p>
              <Link href="/our-story" className="text-link">
                Our story <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ig-band">
        <div className="container">
          <p className="eyebrow">Follow along</p>
          <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
            <InstagramIcon /> {site.instagramHandle}
          </a>
        </div>
      </section>
    </>
  );
}
