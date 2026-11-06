'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getProduct } from '@/lib/catalog';

export type Fulfillment = 'pickup' | 'delivery' | 'shipping';

export interface CartLine {
  slug: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  fulfillment: Fulfillment;
  giftWrap: boolean;
  giftNote: string;
}

interface CartContextValue extends CartState {
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  setFulfillment: (f: Fulfillment) => void;
  setGiftWrap: (v: boolean) => void;
  setGiftNote: (v: string) => void;
}

const STORAGE_KEY = 'cozyflame.cart.v1';
const MAX_QTY = 20;
const initialState: CartState = { lines: [], fulfillment: 'pickup', giftWrap: false, giftNote: '' };

const CartContext = createContext<CartContextValue | null>(null);

function clampQty(n: number) {
  return Math.max(1, Math.min(MAX_QTY, Math.round(n)));
}

/** Keep only lines for products that exist and can be bought. */
function sanitize(state: CartState): CartState {
  return {
    ...state,
    lines: state.lines.filter((l) => {
      const p = getProduct(l.slug);
      return p && p.price !== null && Number.isFinite(l.qty);
    }).map((l) => ({ ...l, qty: clampQty(l.qty) })),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Restore the bag after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(sanitize({ ...initialState, ...JSON.parse(raw) }));
    } catch {
      // Storage blocked or corrupt: start with an empty bag.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the bag still works for this visit.
    }
  }, [state, loaded]);

  const add = useCallback((slug: string, qty = 1) => {
    setState((s) => {
      const existing = s.lines.find((l) => l.slug === slug);
      const lines = existing
        ? s.lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(l.qty + qty) } : l))
        : [...s.lines, { slug, qty: clampQty(qty) }];
      return sanitize({ ...s, lines });
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setState((s) => ({ ...s, lines: s.lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(qty) } : l)) }));
  }, []);

  const remove = useCallback((slug: string) => {
    setState((s) => ({ ...s, lines: s.lines.filter((l) => l.slug !== slug) }));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = state.lines.reduce((sum, l) => sum + (getProduct(l.slug)?.price ?? 0) * l.qty, 0);
    return {
      ...state,
      count,
      subtotal,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      setFulfillment: (fulfillment) => setState((s) => ({ ...s, fulfillment })),
      setGiftWrap: (giftWrap) => setState((s) => ({ ...s, giftWrap })),
      setGiftNote: (giftNote) => setState((s) => ({ ...s, giftNote: giftNote.slice(0, 240) })),
    };
  }, [state, isOpen, add, setQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
