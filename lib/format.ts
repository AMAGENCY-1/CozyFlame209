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
