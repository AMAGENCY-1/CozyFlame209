// Password hashing for the client portal: PBKDF2-SHA256, 600,000 iterations.
// The setup page creates the same format in the browser with Web Crypto, so the
// owner's password never leaves their device. Only this one-way key is stored.
//
// Stored format: pbkdf2:<iterations>:<salt base64url>:<hash base64url>
// (colons, not dollar signs: env files treat `$` as a variable reference)

import { createHash, pbkdf2, scrypt, timingSafeEqual } from 'node:crypto';

function pbkdf2Async(password: string, salt: Buffer, iterations: number, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    pbkdf2(password.normalize('NFKC'), salt, iterations, length, 'sha256', (err, key) => (err ? reject(err) : resolve(key))),
  );
}

function scryptAsync(password: string, salt: Buffer, N: number, r: number, p: number, length: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize('NFKC'), salt, length, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.trim().split(':');
  try {
    if (parts[0] === 'pbkdf2' && parts.length === 4) {
      const [, iterations, saltB64, hashB64] = parts;
      const expected = Buffer.from(hashB64, 'base64url');
      const n = Number(iterations);
      if (!Number.isInteger(n) || n < 100_000 || n > 5_000_000) return false;
      const actual = await pbkdf2Async(password, Buffer.from(saltB64, 'base64url'), n, expected.length);
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
    if (parts[0] === 'scrypt' && parts.length === 6) {
      const [, N, r, p, saltB64, hashB64] = parts;
      const expected = Buffer.from(hashB64, 'base64url');
      const actual = await scryptAsync(password, Buffer.from(saltB64, 'base64url'), +N, +r, +p, expected.length);
      return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
  } catch {
    return false;
  }
  return false;
}

/** Compare two strings in constant time, ignoring case. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a.trim().toLowerCase()).digest();
  const hb = createHash('sha256').update(b.trim().toLowerCase()).digest();
  return timingSafeEqual(ha, hb);
}
