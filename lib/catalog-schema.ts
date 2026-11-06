import { z } from 'zod';

const allowedImage = (src: string) =>
  src === '' ||
  src.startsWith('/images/') ||
  src.startsWith('/uploads/') ||
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(src);

export const productSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
  name: z.string().trim().min(2, 'Add a product name').max(80),
  collection: z.enum(['everyday', 'seasonal', 'wax-melts', 'gift-sets']),
  price: z.number().min(0).max(10000).nullable(),
  status: z.enum(['live', 'coming-soon', 'hidden']),
  notes: z.array(z.string().trim().min(1).max(40)).max(8),
  style: z.string().trim().max(40),
  summary: z.string().trim().max(160),
  description: z.string().trim().max(1200),
  image: z.object({
    src: z.string().max(600).refine(allowedImage, 'Photo must be uploaded through the portal'),
    alt: z.string().trim().max(240),
  }),
  draftNote: z.string().trim().max(200).optional(),
  updatedAt: z.string().optional(),
});

export const catalogDocumentSchema = z.object({
  version: z.literal(1),
  updatedAt: z.string(),
  products: z.array(productSchema).max(500),
});

export type CatalogDocument = z.infer<typeof catalogDocumentSchema>;
