import { MAX_IMAGE_BYTES, StorageNotConfiguredError, storeImage } from '@/lib/catalog-store';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: 'That upload could not be read. Please try again.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Choose a photo to upload.' }, { status: 400 });
  if (!ALLOWED.has(file.type)) return Response.json({ error: 'Use a JPG, PNG or WebP photo.' }, { status: 415 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'That photo is too large. Try one under 4 MB.' }, { status: 413 });

  try {
    const url = await storeImage(await file.arrayBuffer(), file.type, String(form.get('slug') ?? ''));
    return Response.json({ url });
  } catch (err) {
    console.error('[portal] upload failed', err);
    const message = err instanceof StorageNotConfiguredError ? err.message : 'The photo could not be saved. Please try again.';
    return Response.json({ error: message }, { status: 500 });
  }
}
