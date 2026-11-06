const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** "$10" for whole dollars, "$10.50" otherwise. */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? whole.format(amount) : cents.format(amount);
}

export const site = {
  name: 'The Cozy Flame',
  tagline: 'Small candles. Big moments.',
  instagramHandle: '@thec.ozyflame209',
  instagramUrl: 'https://www.instagram.com/thec.ozyflame209',
};

const updatedFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Los_Angeles',
});

/** "Nov 6, 4:12 PM" in California time, for "last saved" labels. */
export function formatUpdated(iso?: string | null): string {
  if (!iso) return 'Not saved yet';
  return updatedFormat.format(new Date(iso));
}
