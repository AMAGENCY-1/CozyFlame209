// Session tokens for the client portal. Edge-safe (used by middleware and server code).
//
// Only one setting is required: PORTAL_PASSWORD_HASH (created on /portal/setup).
// Sessions are signed with PORTAL_SESSION_SECRET when set, otherwise with a key derived
// from the password hash, so changing the password also signs every device out.

import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'cf_studio_session';
export const SESSION_HOURS = 12;
const ISSUER = 'cozyflame-studio';

export interface Session {
  username: string;
  expiresAt: number;
}

export function portalUsername(): string {
  return (process.env.PORTAL_USERNAME || 'thecozyflame').trim();
}

/** True once the owner's password key has been added in Vercel. */
export function portalConfigured(): boolean {
  return Boolean(process.env.PORTAL_PASSWORD_HASH?.trim());
}

async function signingKey(): Promise<Uint8Array | null> {
  const explicit = process.env.PORTAL_SESSION_SECRET;
  if (explicit && explicit.length >= 32) return new TextEncoder().encode(explicit);
  const hash = process.env.PORTAL_PASSWORD_HASH?.trim();
  if (!hash) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`cozyflame-studio-session:${hash}`));
  return new Uint8Array(digest);
}

export async function createSessionToken(username: string): Promise<string> {
  const key = await signingKey();
  if (!key) throw new Error('The portal password has not been set up.');
  return new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(username)
    .setIssuer(ISSUER)
    .setAudience(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key);
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const key = await signingKey();
  if (!key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER, audience: ISSUER, algorithms: ['HS256'] });
    // A token minted for a previous username stops working when the username changes.
    if (!payload.sub || payload.sub !== portalUsername()) return null;
    return { username: payload.sub, expiresAt: (payload.exp ?? 0) * 1000 };
  } catch {
    return null;
  }
}
