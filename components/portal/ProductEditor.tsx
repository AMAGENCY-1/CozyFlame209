'use client';

import Link from 'next/link';
import { useActionState, useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import {
  PLACEHOLDER_IMAGE,
  type CollectionSlug,
  type Product,
  type ProductStatus,
  collections,
  getCollection,
  slugify,
  statusLabels,
} from '@/lib/catalog';
import { formatPrice, formatUpdated } from '@/lib/format';
import { type SaveState, deleteProduct, saveProduct } from '@/lib/portal-actions';
import { CloseIcon, ExternalIcon, ImageIcon, TrashIcon } from '../icons';
import { StatusPill, Toast } from './ui';

interface Draft {
  name: string;
  slug: string;
  collection: CollectionSlug;
  status: ProductStatus;
  price: string;
  priceTba: boolean;
  notes: string[];
  style: string;
  summary: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  draftNote: string;
}

function toDraft(p?: Product): Draft {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    collection: p?.collection ?? 'seasonal',
    status: p?.status ?? 'hidden',
    price: p?.price != null ? String(p.price) : '',
    priceTba: p ? p.price === null : false,
    notes: p?.notes ?? [],
    style: p?.style ?? '',
    summary: p?.summary ?? '',
    description: p?.description ?? '',
    imageSrc: p?.image.src ?? '',
    imageAlt: p?.image.alt ?? '',
    draftNote: p?.draftNote ?? '',
  };
}

const statusHelp: Record<ProductStatus, string> = {
  live: 'On sale. Customers can add it to their bag.',
  'coming-soon': 'Shown on the store, not for sale yet.',
  hidden: 'Saved privately. Not on the store.',
};

const LIMITS = { summary: 160, description: 1200, draftNote: 200 };

/** Shrink big phone photos in the browser before upload: faster, and always under the size limit. */
async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error("This photo format isn't supported. Try a JPG or PNG.");
  });
  const max = 1800;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not prepare the photo.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('This browser could not prepare the photo.'))), 'image/jpeg', 0.86),
  );
}

export function ProductEditor({ product, notice }: { product?: Product; notice?: string | null }) {
  const isNew = !product;
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<Draft>(() => toDraft(product));
  const [baseline, setBaseline] = useState(() => JSON.stringify(toDraft(product)));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [noteInput, setNoteInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error'; id: number } | null>(
    notice ? { message: notice, tone: notice.startsWith('Could') ? 'error' : 'success', id: 0 } : null,
  );

  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveProduct, {});
  // Errors from the last save, hidden again as soon as the owner edits the field they belong to.
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const errors = Object.fromEntries(Object.entries(state.errors ?? {}).filter(([k]) => !fixed.has(k)));
  const dirty = JSON.stringify(draft) !== baseline;

  const errorKeys: Partial<Record<keyof Draft, string[]>> = {
    name: ['name', 'slug'],
    slug: ['slug'],
    price: ['price'],
    priceTba: ['price'],
    status: ['status', 'price', 'image'],
    collection: ['collection'],
    imageSrc: ['image'],
  };
  const markFixed = (key: keyof Draft) => {
    const keys = errorKeys[key];
    if (keys) setFixed((f) => new Set([...f, ...keys]));
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    markFixed(key);
  };

  // After a successful save, the current draft becomes the new baseline.
  useEffect(() => {
    setFixed(new Set());
    if (state.ok && state.savedAt) {
      setBaseline(JSON.stringify(draft));
      setToast({ message: state.message ?? 'Saved.', tone: 'success', id: Date.now() });
    } else if (state.message && !state.ok) {
      setToast({ message: state.message, tone: 'error', id: Date.now() });
    }
    // Only react to new save results.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Escape closes the delete dialog.
  useEffect(() => {
    if (!confirmDelete) return;
    const handler = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setConfirmDelete(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirmDelete]);

  // Cmd/Ctrl + S saves.
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const onName = (value: string) => {
    setDraft((d) => ({ ...d, name: value, slug: slugTouched ? d.slug : slugify(value) }));
    markFixed('name');
  };

  const addNote = () => {
    const value = noteInput.trim().replace(/,$/, '');
    if (!value) return;
    setDraft((d) =>
      d.notes.length >= 8 || d.notes.some((n) => n.toLowerCase() === value.toLowerCase()) ? d : { ...d, notes: [...d.notes, value] },
    );
    setNoteInput('');
  };

  const onNoteKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addNote();
    } else if (e.key === 'Backspace' && !noteInput && draft.notes.length) {
      set('notes', draft.notes.slice(0, -1));
    }
  };

  const uploadPhoto = useCallback(
    async (file: File) => {
      setPhotoError(null);
      if (!file.type.startsWith('image/')) {
        setPhotoError('Choose a photo file (JPG, PNG or WebP).');
        return;
      }
      setUploading(true);
      try {
        const prepared = await prepareImage(file);
        const body = new FormData();
        body.append('file', prepared, 'photo.jpg');
        body.append('slug', draft.slug || slugify(draft.name) || 'product');
        const res = await fetch('/api/portal/upload', { method: 'POST', body });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (res.status === 401) throw new Error('Your session ended. Please sign in again.');
        if (!res.ok || !data.url) throw new Error(data.error ?? 'The photo could not be uploaded. Please try again.');
        setDraft((d) => ({ ...d, imageSrc: data.url!, imageAlt: d.imageAlt || (d.name ? `${d.name} candle` : '') }));
        markFixed('imageSrc');
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : 'The photo could not be uploaded.');
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [draft.slug, draft.name],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadPhoto(file);
  };

  const discard = () => {
    setDraft(JSON.parse(baseline) as Draft);
    setNoteInput('');
    setPhotoError(null);
  };

  const priceNumber = draft.priceTba || draft.price === '' ? null : Number(draft.price);
  const collectionName = getCollection(draft.collection)?.name ?? '';
  const previewSrc = draft.imageSrc || PLACEHOLDER_IMAGE;
  const counter = (key: keyof typeof LIMITS) => (
    <span className={`counter${draft[key].length > LIMITS[key] ? ' over' : ''}`}>
      {draft[key].length}/{LIMITS[key]}
    </span>
  );

  return (
    <>
      {toast && <Toast key={toast.id} message={toast.message} tone={toast.tone} onDone={() => setToast(null)} />}

      <div className="s-head">
        <div>
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/portal/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span>{isNew ? 'New' : 'Edit'}</span>
          </nav>
          <h1>{draft.name || (isNew ? 'New product' : 'Untitled')}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusPill status={draft.status} />
            {!isNew && (
              <span className="field-hint">
                {product?.updatedAt ? `Last saved ${formatUpdated(product.updatedAt)}` : 'From the starting catalog'}
              </span>
            )}
          </div>
        </div>
        <div className="s-head-actions">
          {!isNew && product && product.status !== 'hidden' && (
            <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="s-btn s-btn-ghost">
              <ExternalIcon width={16} height={16} /> View on store
            </a>
          )}
          <button type="submit" form="product-form" className="s-btn s-btn-primary" disabled={pending || uploading}>
            {pending && <span className="spinner" aria-hidden="true" />}
            {pending ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="editor">
        <form id="product-form" ref={formRef} action={formAction} className="editor-main" noValidate>
          <input type="hidden" name="originalSlug" value={product?.slug ?? ''} />
          <input type="hidden" name="notes" value={JSON.stringify(draft.notes)} />
          <input type="hidden" name="imageSrc" value={draft.imageSrc} />

          {/* Photo */}
          <section className="s-panel" aria-labelledby="photo-title">
            <div className="s-panel-head">
              <h2 id="photo-title">Photo</h2>
              <p>Portrait photos look best</p>
            </div>
            <div className="photo-field">
              <div
                className={`photo-frame${draft.imageSrc ? '' : ' empty'}${dragging ? ' dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {draft.imageSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.imageSrc} alt={draft.imageAlt || 'Product photo'} />
                )}
                {!draft.imageSrc && (
                  <button type="button" className="photo-drop" onClick={() => fileRef.current?.click()}>
                    <ImageIcon width={28} height={28} />
                    <span>
                      <strong>Add a photo</strong>
                      <br />
                      Tap to choose, or drag one here
                    </span>
                  </button>
                )}
                {uploading && (
                  <div className="photo-busy" role="status">
                    <span className="spinner" aria-hidden="true" />
                    Uploading photo…
                  </div>
                )}
              </div>
              <div className="photo-actions">
                <input
                  ref={fileRef}
                  id="photo-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadPhoto(file);
                  }}
                />
                <div className="buttons">
                  <button type="button" className="s-btn s-btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <ImageIcon width={16} height={16} /> {draft.imageSrc ? 'Replace photo' : 'Choose photo'}
                  </button>
                  {draft.imageSrc && (
                    <button type="button" className="s-btn s-btn-quiet" onClick={() => set('imageSrc', '')} disabled={uploading}>
                      Remove
                    </button>
                  )}
                </div>
                {(photoError || errors.image) && (
                  <p className="field-error" role="alert">
                    {photoError ?? errors.image}
                  </p>
                )}
                <div className="s-field">
                  <label htmlFor="imageAlt">Photo description</label>
                  <input
                    id="imageAlt"
                    name="imageAlt"
                    className="s-input"
                    value={draft.imageAlt}
                    maxLength={240}
                    placeholder="e.g. Lavender candle with a whipped topping"
                    onChange={(e) => set('imageAlt', e.target.value)}
                  />
                  <p className="field-hint">Read aloud to customers using screen readers, and helps Google.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="s-panel" aria-labelledby="details-title">
            <div className="s-panel-head">
              <h2 id="details-title">Details</h2>
            </div>
            <div className="s-field">
              <label htmlFor="name">Product name</label>
              <input
                id="name"
                name="name"
                className="s-input"
                value={draft.name}
                maxLength={80}
                required
                placeholder="e.g. Vanilla Bean Cocoa"
                aria-invalid={Boolean(errors.name)}
                onChange={(e) => onName(e.target.value)}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div className="field-row">
              <div className="s-field">
                <label htmlFor="collection">Collection</label>
                <select
                  id="collection"
                  name="collection"
                  className="s-select"
                  value={draft.collection}
                  onChange={(e) => set('collection', e.target.value as CollectionSlug)}
                >
                  {collections.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="s-field">
                <label htmlFor="style">Style</label>
                <input
                  id="style"
                  name="style"
                  className="s-input"
                  value={draft.style}
                  maxLength={40}
                  placeholder="e.g. Whipped, Classic jar"
                  onChange={(e) => set('style', e.target.value)}
                />
              </div>
            </div>
            <div className="s-field">
              <div className="label-row">
                <label className="s-label" htmlFor="summary">
                  Short summary
                </label>
                {counter('summary')}
              </div>
              <input
                id="summary"
                name="summary"
                className="s-input"
                value={draft.summary}
                maxLength={LIMITS.summary}
                placeholder="One line shown in search results and link previews"
                onChange={(e) => set('summary', e.target.value)}
              />
            </div>
            <div className="s-field">
              <div className="label-row">
                <label className="s-label" htmlFor="description">
                  Description
                </label>
                {counter('description')}
              </div>
              <textarea
                id="description"
                name="description"
                className="s-textarea"
                value={draft.description}
                maxLength={LIMITS.description}
                rows={5}
                placeholder="What it looks like, how it smells, what makes it special."
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </section>

          {/* Scent */}
          <section className="s-panel" aria-labelledby="scent-title">
            <div className="s-panel-head">
              <h2 id="scent-title">Scent notes</h2>
              <p>Up to 8</p>
            </div>
            <div className="chips" onClick={() => document.getElementById('note-input')?.focus()}>
              {draft.notes.map((n) => (
                <span key={n} className="chip">
                  {n}
                  <button type="button" aria-label={`Remove ${n}`} onClick={() => set('notes', draft.notes.filter((x) => x !== n))}>
                    <CloseIcon width={12} height={12} />
                  </button>
                </span>
              ))}
              {draft.notes.length < 8 && (
                <input
                  id="note-input"
                  value={noteInput}
                  placeholder={draft.notes.length ? 'Add another' : 'Type a note, then press Enter'}
                  aria-label="Add a scent note"
                  maxLength={40}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={onNoteKey}
                  onBlur={addNote}
                />
              )}
            </div>
          </section>

          {/* Price & availability */}
          <section className="s-panel" aria-labelledby="availability-title">
            <div className="s-panel-head">
              <h2 id="availability-title">Price &amp; availability</h2>
            </div>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="s-label" style={{ marginBottom: 10 }}>
                Where it appears
              </legend>
              <div className="status-options">
                {(Object.keys(statusLabels) as ProductStatus[]).map((s) => (
                  <label key={s} className="status-option">
                    <input type="radio" name="status" value={s} checked={draft.status === s} onChange={() => set('status', s)} />
                    <strong>
                      <span className={`dot dot-${s}`} aria-hidden="true" /> {statusLabels[s]}
                    </strong>
                    <small>{statusHelp[s]}</small>
                  </label>
                ))}
              </div>
              {errors.status && <p className="field-error">{errors.status}</p>}
            </fieldset>

            <div className="field-row">
              <div className="s-field">
                <label htmlFor="price">Price</label>
                <div className="price-wrap">
                  <span aria-hidden="true">$</span>
                  <input
                    id="price"
                    name="price"
                    className="s-input"
                    inputMode="decimal"
                    value={draft.priceTba ? '' : draft.price}
                    disabled={draft.priceTba}
                    placeholder={draft.priceTba ? 'Announced later' : '10'}
                    aria-invalid={Boolean(errors.price)}
                    onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, '').slice(0, 9))}
                  />
                </div>
                <label className="s-check">
                  <input id="priceTba" type="checkbox" name="priceTba" checked={draft.priceTba} onChange={(e) => set('priceTba', e.target.checked)} />
                  Price to be announced
                </label>
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>
              <div className="s-field">
                <div className="label-row">
                  <label className="s-label" htmlFor="draftNote">
                    Note for customers
                  </label>
                  {counter('draftNote')}
                </div>
                <input
                  id="draftNote"
                  name="draftNote"
                  className="s-input"
                  value={draft.draftNote}
                  maxLength={LIMITS.draftNote}
                  placeholder="Optional, e.g. Releasing December 1"
                  onChange={(e) => set('draftNote', e.target.value)}
                />
                <p className="field-hint">Shown on the product page.</p>
              </div>
            </div>
          </section>

          {/* Web address */}
          <section className="s-panel" aria-labelledby="address-title">
            <div className="s-panel-head">
              <h2 id="address-title">Web address</h2>
            </div>
            <div className="s-field">
              <label htmlFor="slug" className="visually-hidden">
                Web address
              </label>
              <div className="slug-wrap">
                <span>/products/</span>
                <input
                  id="slug"
                  name="slug"
                  className="s-input"
                  value={draft.slug}
                  maxLength={80}
                  aria-invalid={Boolean(errors.slug)}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', slugify(e.target.value));
                  }}
                />
              </div>
              {errors.slug ? (
                <p className="field-error">{errors.slug}</p>
              ) : (
                <p className="field-hint">Filled in from the name. Changing it later breaks links people have saved.</p>
              )}
            </div>
          </section>

          {!isNew && (
            <section className="s-panel danger-zone" aria-labelledby="danger-title">
              <div className="s-panel-head">
                <h2 id="danger-title">Delete product</h2>
              </div>
              <p className="field-hint">Removes it from your store and the portal. To take it down for now, choose Hidden instead.</p>
              <div>
                <button type="button" className="s-btn s-btn-ghost" onClick={() => setConfirmDelete(true)}>
                  <TrashIcon width={16} height={16} /> Delete product
                </button>
              </div>
            </section>
          )}
        </form>

        {/* Live preview */}
        <aside className="editor-side" aria-label="Store preview">
          <div className="preview-card">
            <p className="studio-eyebrow" style={{ gridColumn: '1 / -1' }}>
              Store preview
            </p>
            <div className="product-card-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="" className={draft.imageSrc ? undefined : 'placeholder-img'} />
              <span className="tag">{draft.status === 'coming-soon' ? 'Coming soon' : draft.style || 'Handcrafted'}</span>
            </div>
            <div className="product-card-body">
              <h3>{draft.name || 'Product name'}</h3>
              <p className="notes">{draft.notes.length ? draft.notes.join(' · ') : 'Scent announced soon'}</p>
              <p className="price">
                {priceNumber === null || Number.isNaN(priceNumber) ? 'Price coming soon' : formatPrice(priceNumber)}
              </p>
            </div>
            <dl className="preview-meta">
              <div>
                <dt>Collection</dt>
                <dd>{collectionName}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{statusLabels[draft.status]}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>/products/{draft.slug || '…'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Floating save bar */}
      <div className="save-bar" data-show={dirty || pending} aria-hidden={!(dirty || pending)}>
        <p>
          <span className="dot dot-coming-soon" aria-hidden="true" />
          {pending ? 'Saving your changes…' : 'You have unsaved changes'}
        </p>
        <div className="actions">
          <button type="button" className="s-btn s-btn-quiet" onClick={discard} disabled={pending} tabIndex={dirty ? 0 : -1}>
            Discard
          </button>
          <button type="submit" form="product-form" className="s-btn s-btn-gold" disabled={pending || uploading} tabIndex={dirty ? 0 : -1}>
            {pending && <span className="spinner" aria-hidden="true" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>

      {confirmDelete && product && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmDelete(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="delete-title">Delete {product.name}?</h2>
            <p>It will be removed from your store right away. This can&apos;t be undone from the portal.</p>
            <form action={deleteProduct} className="actions">
              <input type="hidden" name="slug" value={product.slug} />
              <button type="button" className="s-btn s-btn-ghost" onClick={() => setConfirmDelete(false)} autoFocus>
                Keep it
              </button>
              <button type="submit" className="s-btn s-btn-danger">
                <TrashIcon width={16} height={16} /> Delete
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
