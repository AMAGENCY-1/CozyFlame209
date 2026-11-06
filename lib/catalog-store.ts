// Server-only: reads and writes the live catalog.
//
// Storage, in order of preference:
//   1. Vercel Blob (production): every save writes a new versioned JSON file, the newest one wins,
//      and the last 20 versions are kept as history.
//   2. A local JSON file in .data/ (development, or PORTAL_LOCAL_STORE=1).
//   3. Neither configured: the store shows the starting catalog and the portal can't save.

import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { del, list, put } from '@vercel/blob';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { type Product, isVisible, seedProducts } from './catalog';
import { type CatalogDocument, catalogDocumentSchema } from './catalog-schema';

const CATALOG_PREFIX = 'catalog/products-';
const KEEP_VERSIONS = 20;
const LOCAL_DIR = path.join(process.cwd(), '.data');
const LOCAL_FILE = path.join(LOCAL_DIR, 'catalog.json');
const LOCAL_UPLOADS = path.join(process.cwd(), 'public', 'uploads');

export type StorageMode = 'blob' | 'local' | 'none';

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Storage is not connected, so changes cannot be saved yet.');
  }
}

export function storageMode(): StorageMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return 'blob';
  if (process.env.NODE_ENV === 'development' || process.env.PORTAL_LOCAL_STORE === '1') return 'local';
  return 'none';
}

export interface CatalogSnapshot {
  products: Product[];
  updatedAt: string | null;
  source: 'saved' | 'starting';
}

/** Uncached read. Use in the portal, where the newest data matters. */
export async function readCatalog(): Promise<CatalogSnapshot> {
  const mode = storageMode();
  try {
    if (mode === 'blob') {
      const { blobs } = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
      const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
      console.info(`[catalog] blob store reachable, ${blobs.length} saved version(s)`);
      if (latest) {
        const res = await fetch(latest.url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
        const doc = catalogDocumentSchema.parse(await res.json());
        return { products: doc.products as Product[], updatedAt: doc.updatedAt, source: 'saved' };
      }
    } else if (mode === 'local') {
      const raw = await fs.readFile(LOCAL_FILE, 'utf8').catch(() => null);
      if (raw) {
        const doc = catalogDocumentSchema.parse(JSON.parse(raw));
        return { products: doc.products as Product[], updatedAt: doc.updatedAt, source: 'saved' };
      }
    }
  } catch (err) {
    // Never take the store down over a read problem: fall back to the starting catalog and log it.
    console.error('[catalog] read failed, showing the starting catalog instead', err);
  }
  return { products: seedProducts, updatedAt: null, source: 'starting' };
}

const cachedCatalog = unstable_cache(readCatalog, ['cozyflame-catalog-v1'], { tags: ['catalog'] });

/** Cached read for the storefront. Refreshed instantly whenever the portal saves. */
export async function getStoreProducts(): Promise<Product[]> {
  const { products } = await cachedCatalog();
  return products.filter(isVisible);
}

export async function getStoreProduct(slug: string): Promise<Product | undefined> {
  return (await getStoreProducts()).find((p) => p.slug === slug);
}

/** Validate and save the whole catalog, then refresh every store page. */
export async function writeCatalog(products: Product[]): Promise<CatalogDocument> {
  const doc = catalogDocumentSchema.parse({ version: 1, updatedAt: new Date().toISOString(), products });
  const body = JSON.stringify(doc, null, 2);
  const mode = storageMode();

  if (mode === 'blob') {
    await put(`${CATALOG_PREFIX}${Date.now()}.json`, body, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true,
      cacheControlMaxAge: 31536000, // each version has its own URL, so it can be cached for good
    });
    await pruneOldVersions();
  } else if (mode === 'local') {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(LOCAL_FILE, body, 'utf8');
  } else {
    throw new StorageNotConfiguredError();
  }

  revalidateTag('catalog');
  revalidatePath('/', 'layout');
  return doc;
}

async function pruneOldVersions() {
  try {
    const { blobs } = await list({ prefix: CATALOG_PREFIX, limit: 1000 });
    const old = blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .slice(KEEP_VERSIONS)
      .map((b) => b.url);
    if (old.length) await del(old);
  } catch (err) {
    console.error('[catalog] could not prune old versions', err);
  }
}

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Store an uploaded product photo and return its public URL or path. */
export async function storeImage(data: ArrayBuffer, contentType: string, slugHint: string): Promise<string> {
  const ext = IMAGE_TYPES[contentType];
  if (!ext) throw new Error('Use a JPG, PNG or WebP photo.');
  if (data.byteLength > MAX_IMAGE_BYTES) throw new Error('That photo is too large. Try one under 4 MB.');
  const base = (slugHint || 'product').replace(/[^a-z0-9-]/g, '').slice(0, 60) || 'product';
  const name = `${base}-${randomUUID().slice(0, 8)}.${ext}`;
  const mode = storageMode();

  if (mode === 'blob') {
    const blob = await put(`products/${name}`, Buffer.from(data), {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }
  if (mode === 'local') {
    await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
    await fs.writeFile(path.join(LOCAL_UPLOADS, name), Buffer.from(data));
    return `/uploads/${name}`;
  }
  throw new StorageNotConfiguredError();
}

/** Remove a photo the portal uploaded. Built-in photos under /images are never touched. */
export async function deleteImage(src: string | undefined) {
  if (!src) return;
  try {
    if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/products\//i.test(src) && storageMode() === 'blob') {
      await del(src);
    } else if (src.startsWith('/uploads/') && storageMode() === 'local') {
      const file = path.join(LOCAL_UPLOADS, path.basename(src));
      await fs.unlink(file).catch(() => undefined);
    }
  } catch (err) {
    console.error('[catalog] could not delete old photo', err);
  }
}
