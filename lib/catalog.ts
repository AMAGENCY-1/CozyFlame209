// Product catalog for the preview build.
// At launch this file is replaced by Shopify data; the shapes below match what the pages need.

export type CollectionSlug = 'everyday' | 'seasonal' | 'wax-melts' | 'gift-sets';

export interface Collection {
  slug: CollectionSlug;
  name: string;
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  collection: CollectionSlug;
  /** Price in US dollars. `null` means the price is still being confirmed, so it can't be added to the bag. */
  price: number | null;
  notes: string[];
  /** Short style line, e.g. "Whipped" or "Classic jar". */
  style: string;
  summary: string;
  description: string;
  image: { src: string; alt: string };
  /** Shown on the product page while a detail is still being confirmed with the client. */
  draftNote?: string;
}

export const collections: Collection[] = [
  {
    slug: 'seasonal',
    name: 'Seasonal',
    description: 'Limited pours that follow the calendar, from crisp fall evenings to the holidays.',
  },
  {
    slug: 'everyday',
    name: 'Everyday',
    description: 'Small candles for ordinary days that deserve a little glow.',
  },
  {
    slug: 'wax-melts',
    name: 'Wax Melts',
    description: 'Flameless fragrance for your warmer, in the same signature scents.',
  },
  {
    slug: 'gift-sets',
    name: 'Gift Sets',
    description: "Boxed, wrapped and ready for someone's big moment.",
  },
];

export const products: Product[] = [
  {
    slug: 'lavender-in-bloom',
    name: 'Lavender in Bloom',
    collection: 'seasonal',
    price: 10,
    notes: ['Pumpkin', 'Lavender', 'Sandalwood'],
    style: 'Whipped',
    summary: 'Whipped lavender topping with hand-molded pumpkins.',
    description:
      'Sage-green wax beneath a whipped lavender topping, finished with hand-molded pumpkins and leaves. Poured into a glass tumbler printed with rose-gold pumpkins.',
    image: {
      src: '/images/products/lavender-in-bloom.jpg',
      alt: 'Lavender in Bloom candle: sage-green wax with a purple whipped topping, molded pumpkins and green leaves, in a glass printed with pumpkins.',
    },
  },
  {
    slug: 'crisp-apple-pumpkin',
    name: 'Crisp Apple Pumpkin',
    collection: 'seasonal',
    price: 10,
    notes: ['Pumpkin', 'Sweet apple'],
    style: 'Classic jar',
    summary: 'Warm pumpkin and sweet apple in a clear glass jar.',
    description:
      'Creamy wax in a clear glass jar, scattered with dried botanicals. Warm pumpkin meets sweet, crisp apple for the first cool evenings of fall.',
    image: {
      src: '/images/products/crisp-apple-pumpkin.jpg',
      alt: 'Crisp Apple Pumpkin candle: cream wax with dried botanicals in a clear glass jar.',
    },
  },
  {
    slug: 'holiday-whipped-mug',
    name: 'Holiday Whipped Mug',
    collection: 'seasonal',
    price: null,
    notes: [],
    style: 'Whipped',
    summary: 'Cranberry wax, whipped topping and molded evergreens.',
    description:
      'Deep cranberry wax in a glass mug, piled high with whipped wax and molded evergreen trees. Made for the holiday table.',
    image: {
      src: '/images/products/holiday-whipped-mug.jpg',
      alt: 'Holiday Whipped Mug candle: deep red wax in a glass mug with a white whipped topping and molded trees.',
    },
    draftNote: 'Name, scent and price are being confirmed for the holiday release.',
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function productsIn(slug: CollectionSlug): Product[] {
  return products.filter((p) => p.collection === slug);
}

export function isPurchasable(p: Product): p is Product & { price: number } {
  return p.price !== null;
}
