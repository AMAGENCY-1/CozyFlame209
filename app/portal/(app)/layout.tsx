import type { ReactNode } from 'react';
import { PortalShell } from '@/components/portal/PortalShell';
import { storageMode } from '@/lib/catalog-store';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  return (
    <PortalShell username={session.username} storageWarning={storageMode() === 'none'}>
      {children}
    </PortalShell>
  );
}
