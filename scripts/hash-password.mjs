// Create a password key for the client portal from the command line.
// (The owner can do the same in the browser at /portal/setup.)
// Usage: npm run portal:hash -- "the new password"
// Then set the output as PORTAL_PASSWORD_HASH in Vercel (Project → Settings → Environment Variables) and redeploy.
import { pbkdf2, randomBytes } from 'node:crypto';

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Pass a password of at least 12 characters: npm run portal:hash -- "your password"');
  process.exit(1);
}

const iterations = 600000;
const salt = randomBytes(16);
pbkdf2(password.normalize('NFKC'), salt, iterations, 32, 'sha256', (err, key) => {
  if (err) throw err;
  console.log(['pbkdf2', iterations, salt.toString('base64url'), key.toString('base64url')].join(':'));
});
