import type { Metadata } from 'next';
import { DraftChip, PageIntro } from '@/components/Bits';
import { InquiryForm } from '@/components/Forms';

export const metadata: Metadata = {
  title: 'Custom & event candles',
  description: 'Custom candles for weddings, showers, quinceañeras, birthdays and corporate gifts, handcrafted in the 209.',
};

const steps = [
  { title: 'Tell us your moment', body: 'Share the date, the guest count and the feeling you want in the room.' },
  { title: 'We design it together', body: 'Colors, scents, toppings and packaging, matched to your theme.' },
  { title: 'Approve and we pour', body: 'Every candle is made by hand for your order once you say yes.' },
  { title: 'Pickup or delivery', body: 'Collect in the 209 or have them delivered before your date.' },
];

export default function CustomOrdersPage() {
  return (
    <>
      <PageIntro eyebrow="Custom & events" title="Big moments, made to order">
        <p>
          Favors your guests take home, centerpieces for the table, or gifts with your name on them. Handcrafted in your
          colors and scents.
        </p>
      </PageIntro>

      <section className="section" style={{ paddingTop: 'clamp(24px, 4vw, 48px)' }}>
        <div className="container">
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--paper)' }}>
        <div className="container form-section">
          <div className="copy">
            <p className="eyebrow">Start an inquiry</p>
            <h2>Tell us about your event</h2>
            <p>Weddings, baby showers, quinceañeras, birthdays, bridal showers and corporate gifts.</p>
            <p>
              Minimum order sizes and lead times will be listed here at launch. <DraftChip>To confirm</DraftChip>
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
