'use client';

import { useState, type FormEvent, type ReactNode } from 'react';

/**
 * Preview forms: they validate and confirm on screen, but send nothing yet.
 * At launch each one posts to the client's inbox or email platform.
 */
function usePreviewSubmit() {
  const [sentName, setSentName] = useState<string | null>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = (new FormData(form).get('name') as string | null)?.trim();
    setSentName(name || '');
  };
  return { sentName, onSubmit, reset: () => setSentName(null) };
}

function Confirmation({ title, children, onReset }: { title: string; children: ReactNode; onReset: () => void }) {
  return (
    <div className="form-confirmation" role="status">
      <h3>{title}</h3>
      <p>{children}</p>
      <button type="button" className="text-button" onClick={onReset}>
        Send another
      </button>
    </div>
  );
}

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <p className="newsletter-done" role="status">
        You're on the list. (Preview: signups start collecting at launch.)
      </p>
    );
  }
  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity()) setDone(true);
        else e.currentTarget.reportValidity();
      }}
      noValidate
    >
      <label htmlFor="newsletter-email" className="visually-hidden">
        Email address
      </label>
      <input id="newsletter-email" name="email" type="email" required placeholder="Your email" autoComplete="email" />
      <button type="submit" className="btn btn-gold">
        Join
      </button>
    </form>
  );
}

const eventTypes = ['Wedding', 'Baby shower', 'Quinceañera', 'Birthday', 'Corporate gifts', 'Something else'];

export function InquiryForm() {
  const { sentName, onSubmit, reset } = usePreviewSubmit();
  if (sentName !== null) {
    return (
      <Confirmation title={`Thank you${sentName ? `, ${sentName}` : ''}.`} onReset={reset}>
        This is a preview, so nothing was sent. At launch, inquiries go straight to The Cozy Flame.
      </Confirmation>
    );
  }
  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>Name</span>
        <input id="inquiry-name" name="name" required autoComplete="name" />
      </label>
      <label className="field">
        <span>Email</span>
        <input id="inquiry-email" name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>Phone (optional)</span>
        <input id="inquiry-phone" name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="field">
        <span>Event</span>
        <select id="inquiry-event" name="event" required defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          {eventTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Event date</span>
        <input id="inquiry-date" name="date" type="date" />
      </label>
      <label className="field">
        <span>How many candles?</span>
        <input id="inquiry-qty" name="quantity" type="number" min={1} inputMode="numeric" placeholder="e.g. 40" />
      </label>
      <label className="field field-wide">
        <span>Colors, scents or theme</span>
        <input id="inquiry-theme" name="theme" placeholder="Blush and gold, lavender, rustic fall…" />
      </label>
      <label className="field field-wide">
        <span>Tell us about your moment</span>
        <textarea id="inquiry-message" name="message" rows={4} required />
      </label>
      <div className="field-wide">
        <button type="submit" className="btn btn-dark">
          Send inquiry
        </button>
      </div>
    </form>
  );
}

export function ContactForm() {
  const { sentName, onSubmit, reset } = usePreviewSubmit();
  if (sentName !== null) {
    return (
      <Confirmation title={`Thanks${sentName ? `, ${sentName}` : ''}.`} onReset={reset}>
        This is a preview, so nothing was sent. At launch, messages go straight to The Cozy Flame.
      </Confirmation>
    );
  }
  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <label className="field">
        <span>Name</span>
        <input id="contact-name" name="name" required autoComplete="name" />
      </label>
      <label className="field">
        <span>Email</span>
        <input id="contact-email" name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field field-wide">
        <span>Message</span>
        <textarea id="contact-message" name="message" rows={4} required />
      </label>
      <div className="field-wide">
        <button type="submit" className="btn btn-dark">
          Send message
        </button>
      </div>
    </form>
  );
}
