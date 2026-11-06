'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_HOURS, createSessionToken, portalConfigured, portalUsername } from './auth';
import { type CollectionSlug, type Product, type ProductStatus, slugify } from './catalog';
import { productSchema } from './catalog-schema';
import { StorageNotConfiguredError, deleteImage, readCatalog, writeCatalog } from './catalog-store';
import { safeEqual, verifyPassword } from './password';
import { getSession } from './session';

/* ------------------------------------------------------------------ */
/* Sign in / sign out                                                  */
/* ------------------------------------------------------------------ */

export interface LoginState {
  error?: string;
}

// Best-effort throttle per server instance: 8 failed attempts per 15 minutes per IP.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function tooManyAttempts(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string) {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) attempts.set(ip, { count: 1, first: Date.now() });
  else entry.count += 1;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

function safeNext(next: FormDataEntryValue | null): string {
  const value = typeof next === 'string' ? next : '';
  return value.startsWith('/portal') && !value.startsWith('//') && !value.startsWith('/portal/login') ? value : '/portal';
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!portalConfigured()) {
    return { error: 'Your studio password hasn’t been set up yet. Use the setup link on this page to create it.' };
  }

  const ip = ((await headers()).get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  if (tooManyAttempts(ip)) {
    return { error: 'Too many attempts. Please wait 15 minutes and try again.' };
  }

  const username = String(formData.get('username') ?? '').slice(0, 120);
  const password = String(formData.get('password') ?? '').slice(0, 200);

  const userOk = safeEqual(username, portalUsername());
  const passOk = await verifyPassword(password, process.env.PORTAL_PASSWORD_HASH!);

  if (!userOk || !passOk) {
    recordFailure(ip);
    await pause(450);
    return { error: "That username and password don't match. Please try again." };
  }

  attempts.delete(ip);
  const token = await createSessionToken(portalUsername());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
  });
  redirect(safeNext(formData.get('next')));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/portal/login?signedOut=1');
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export interface SaveState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  savedAt?: number;
}

const STATUSES: ProductStatus[] = ['live', 'coming-soon', 'hidden'];
const COLLECTIONS: CollectionSlug[] = ['everyday', 'seasonal', 'wax-melts', 'gift-sets'];

function text(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) ?? '').trim().slice(0, max);
}

export async function saveProduct(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  if (!session) redirect('/portal/login');

  const originalSlug = text(formData, 'originalSlug', 80);
  const isNew = originalSlug === '';
  const name = text(formData, 'name', 80);
  const requestedSlug = slugify(text(formData, 'slug', 80) || name);
  const status = text(formData, 'status', 20) as ProductStatus;
  const collection = text(formData, 'collection', 20) as CollectionSlug;
  const priceTba = formData.get('priceTba') === 'on';
  const priceRaw = text(formData, 'price', 12).replace(/[$,\s]/g, '');
  const price = priceTba || priceRaw === '' ? null : Math.round(Number(priceRaw) * 100) / 100;

  let notes: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get('notes') ?? '[]'));
    if (Array.isArray(parsed)) notes = parsed.map((n) => String(n).trim()).filter(Boolean).slice(0, 8);
  } catch {
    notes = [];
  }

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Add a product name.';
  if (!requestedSlug) errors.slug = 'Add a web address.';
  if (!STATUSES.includes(status)) errors.status = 'Choose where this product appears.';
  if (!COLLECTIONS.includes(collection)) errors.collection = 'Choose a collection.';
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 10000)) errors.price = 'Enter a price between $0 and $10,000.';

  const imageSrc = text(formData, 'imageSrc', 600);
  if (status === 'live' && price === null && !errors.price) errors.price = 'Live products need a price. Set one, or mark the product Coming soon.';
  if (status === 'live' && !imageSrc) errors.image = 'Live products need a photo. Add one, or mark the product Coming soon.';

  const { products } = await readCatalog();
  const existing = isNew ? undefined : products.find((p) => p.slug === originalSlug);
  if (!isNew && !existing) return { message: 'This product no longer exists. It may have been deleted.', errors: {} };
  if (products.some((p) => p.slug === requestedSlug && p.slug !== originalSlug)) {
    errors.slug = 'Another product already uses this web address.';
  }

  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors };

  const product: Product = {
    slug: requestedSlug,
    name,
    collection,
    price,
    status,
    notes,
    style: text(formData, 'style', 40),
    summary: text(formData, 'summary', 160),
    description: text(formData, 'description', 1200),
    image: { src: imageSrc, alt: text(formData, 'imageAlt', 240) || `${name} candle` },
    draftNote: text(formData, 'draftNote', 200) || undefined,
    updatedAt: new Date().toISOString(),
  };

  const parsed = productSchema.safeParse(product);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
    return { ok: false, message: 'Please fix the highlighted fields.', errors: fieldErrors };
  }

  const next = isNew ? [product, ...products] : products.map((p) => (p.slug === originalSlug ? product : p));

  try {
    await writeCatalog(next);
  } catch (err) {
    console.error('[portal] save failed', err);
    return {
      ok: false,
      message: err instanceof StorageNotConfiguredError ? err.message : 'Something went wrong while saving. Please try again.',
    };
  }

  if (existing && existing.image.src !== product.image.src) await deleteImage(existing.image.src);

  if (isNew || requestedSlug !== originalSlug) redirect(`/portal/products/${requestedSlug}?saved=1`);
  return { ok: true, message: product.status === 'hidden' ? 'Saved. This product is hidden from the store.' : 'Saved. Your store is updated.', savedAt: Date.now() };
}

export async function deleteProduct(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/portal/login');

  const slug = text(formData, 'slug', 80);
  const { products } = await readCatalog();
  const target = products.find((p) => p.slug === slug);
  if (!target) redirect('/portal/products');

  try {
    await writeCatalog(products.filter((p) => p.slug !== slug));
  } catch (err) {
    console.error('[portal] delete failed', err);
    redirect(`/portal/products/${slug}?error=delete`);
  }
  await deleteImage(target.image.src);
  redirect(`/portal/products?deleted=${encodeURIComponent(target.name)}`);
}
