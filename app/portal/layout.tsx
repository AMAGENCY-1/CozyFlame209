import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './portal.css';

export const metadata: Metadata = {
  title: { default: 'Studio', template: '%s · Studio · The Cozy Flame' },
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div className="studio-body">{children}</div>;
}
