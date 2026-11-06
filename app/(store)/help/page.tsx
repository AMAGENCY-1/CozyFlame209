import type { Metadata } from 'next';
import Link from 'next/link';
import { DraftChip, PageIntro } from '@/components/Bits';
import { ContactForm } from '@/components/Forms';
import { site } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Help & contact',
  description: 'Pickup, delivery, shipping, candle care and how to reach The Cozy Flame.',
};

const faqs = [
  {
    q: 'Can I pick up my order?',
    a: 'Yes. Choose "Pickup in the 209" in your bag, and pickup details arrive with your order confirmation.',
  },
  {
    q: 'Do you deliver locally?',
    a: 'Local delivery is offered in parts of the 209. Zones and fees appear at checkout.',
  },
  {
    q: 'Do you ship?',
    a: 'We ship within California. In hot months, orders ship early in the week so candles spend less time in a warm truck.',
  },
  {
    q: 'Can I order candles for an event?',
    a: 'Absolutely. Weddings, showers, quinceañeras, birthdays and corporate gifts are all welcome.',
    link: { href: '/custom-orders', label: 'Start an inquiry' },
  },
  {
    q: 'Can I send a candle as a gift?',
    a: 'Yes. Add gift wrap and a handwritten note in your bag before checkout.',
  },
];

export default function HelpPage() {
  return (
    <>
      <PageIntro eyebrow="Help & contact" title="How can we help?">
        <p>Pickup, delivery, candle care and the answers to common questions.</p>
      </PageIntro>

      <section className="container" style={{ paddingBottom: 'var(--section)' }}>
        <div className="help-layout">
          <nav className="help-nav" aria-label="On this page">
            <a href="#faq">Questions</a>
            <a href="#pickup">Pickup &amp; delivery</a>
            <a href="#care">Candle care</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="help-sections">
            <section id="faq" aria-labelledby="faq-title">
              <h2 id="faq-title">
                Questions <DraftChip>Draft answers</DraftChip>
              </h2>
              <div className="accordion">
                {faqs.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <div className="panel">
                      <p>{f.a}</p>
                      {f.link && (
                        <p>
                          <Link href={f.link.href} className="text-link">
                            {f.link.label}
                          </Link>
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section id="pickup" aria-labelledby="pickup-title">
              <h2 id="pickup-title">Pickup &amp; delivery</h2>
              <ul>
                <li>
                  <strong>Pickup in the 209:</strong> pickup spot and times are sent with your confirmation.
                </li>
                <li>
                  <strong>Local delivery:</strong> available in parts of the 209, with zones and fees shown at checkout.
                </li>
                <li>
                  <strong>Shipping:</strong> within California, sent early in the week to beat the Central Valley heat.
                </li>
              </ul>
              <p>
                Locations, zones, fees and the returns policy will be posted here before launch. <DraftChip>To confirm</DraftChip>
              </p>
            </section>

            <section id="care" aria-labelledby="care-title">
              <h2 id="care-title">Candle care</h2>
              <ul>
                <li>Burn within sight. Keep away from children, pets and anything that can catch fire.</li>
                <li>On the first burn, let the wax melt all the way to the edge of the glass. This prevents tunneling.</li>
                <li>Trim the wick to about ¼ inch before each burn for a clean, steady flame.</li>
                <li>Burn on a heat-safe surface, away from drafts.</li>
                <li>Stop burning when about ½ inch of wax remains.</li>
              </ul>
            </section>

            <section id="contact" aria-labelledby="contact-title">
              <h2 id="contact-title">Contact</h2>
              <p>
                Send a message below, or reach us on Instagram at{' '}
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-ink)' }}>
                  {site.instagramHandle}
                </a>
                .
              </p>
              <ContactForm />
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
