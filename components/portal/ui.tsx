'use client';

import { useEffect, useRef, useState } from 'react';
import { type ProductStatus, statusLabels } from '@/lib/catalog';
import { CheckIcon, CloseIcon } from '../icons';

export function StatusPill({ status }: { status: ProductStatus }) {
  return (
    <span className={`pill pill-${status}`}>
      <span className={`dot dot-${status}`} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

/** A small confirmation that fades away on its own. */
export function Toast({ message, tone = 'success', onDone }: { message: string | null; tone?: 'success' | 'error'; onDone?: () => void }) {
  const [visible, setVisible] = useState(Boolean(message));
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      doneRef.current?.();
    }, 4200);
    return () => clearTimeout(t);
  }, [message]);

  if (!message || !visible) return null;
  return (
    <div className={`toast${tone === 'error' ? ' error' : ''}`} role="status" aria-live="polite">
      <span className="icon">{tone === 'error' ? <CloseIcon width={16} height={16} /> : <CheckIcon width={16} height={16} />}</span>
      <span>{message}</span>
    </div>
  );
}
