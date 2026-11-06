// Catalog types, collections and the starting products.
// Safe to import anywhere (server or browser). The live catalog is read and written in lib/catalog-store.ts.

export type CollectionSlug = 'everyday' | 'seasonal' | 'wax-melts' | 'gift-sets';
export type ProductStatus = 'live' | 'coming-soon' | 'hidden';

export interface Collection {
  slug: CollectionSlug;
  name: string;
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  collection: CollectionSlug;
  /** Price in US dollars. `null` = price to be announced. */
  price: number | null;
  /** live = on sale · coming-soon = shown, not purchasable · hidden = not on the store */
  status: ProductStatus;
  notes: string[];
  /** Short style line, e.g. "Whipped" or "Classic jar". */
  style: string;
  summary: string;
  description: string;
  /** `src` may be a local path or an uploaded photo URL. Empty = no photo yet. */
  image: { src: string; alt: string };
  /** Optional note shown on the product page, e.g. "Releasing December 1". */
  draftNote?: string;
  updatedAt?: string;
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

export const statusLabels: Record<ProductStatus, string> = {
  live: 'Live',
  'coming-soon': 'Coming soon',
  hidden: 'Hidden',
};

/** The catalog the store starts with, before the client saves anything in the portal. */
export const seedProducts: Product[] = [
  {
    slug: 'lavender-in-bloom',
    name: 'Lavender in Bloom',
    collection: 'seasonal',
    price: 10,
    status: 'live',
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
    status: 'live',
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
    status: 'coming-soon',
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

export const PLACEHOLDER_IMAGE = '/images/brand/logo-badge-1000.png';

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function isPurchasable(p: Product): boolean {
  return p.status === 'live' && p.price !== null;
}

export function isVisible(p: Product): boolean {
  return p.status !== 'hidden';
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
