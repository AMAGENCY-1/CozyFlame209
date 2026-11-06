import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, type Session, verifySessionToken } from './auth';

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Every portal page and action calls this, on top of the middleware check. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/portal/login');
  return session;
}
