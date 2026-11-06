'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Fulfillment = 'pickup' | 'delivery' | 'shipping';

/** The few product fields the bag needs. `price` is null when it can't be bought. */
export interface CartProduct {
  slug: string;
  name: string;
  price: number | null;
  notes: string[];
  image: string;
}

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
  getProduct: (slug: string) => CartProduct | undefined;
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

export function CartProvider({ catalog, children }: { catalog: CartProduct[]; children: ReactNode }) {
  const [state, setState] = useState<CartState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const bySlug = useMemo(() => new Map(catalog.map((p) => [p.slug, p])), [catalog]);
  const getProduct = useCallback((slug: string) => bySlug.get(slug), [bySlug]);

  /** Drop lines for products that were removed, hidden or taken off sale. */
  const sanitize = useCallback(
    (s: CartState): CartState => ({
      ...s,
      lines: s.lines
        .filter((l) => bySlug.get(l.slug)?.price != null && Number.isFinite(l.qty))
        .map((l) => ({ ...l, qty: clampQty(l.qty) })),
    }),
    [bySlug],
  );

  // Restore the bag after mount so server and client render the same first frame.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(sanitize({ ...initialState, ...JSON.parse(raw) }));
    } catch {
      // Storage blocked or corrupt: start with an empty bag.
    }
    setLoaded(true);
    // Run once on mount; catalog changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the catalog changes (the owner edits products), keep the bag consistent.
  useEffect(() => {
    if (loaded) setState((s) => sanitize(s));
  }, [sanitize, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: the bag still works for this visit.
    }
  }, [state, loaded]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      setState((s) => {
        const existing = s.lines.find((l) => l.slug === slug);
        const lines = existing
          ? s.lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(l.qty + qty) } : l))
          : [...s.lines, { slug, qty: clampQty(qty) }];
        return sanitize({ ...s, lines });
      });
      setIsOpen(true);
    },
    [sanitize],
  );

  const setQty = useCallback((slug: string, qty: number) => {
    setState((s) => ({ ...s, lines: s.lines.map((l) => (l.slug === slug ? { ...l, qty: clampQty(qty) } : l)) }));
  }, []);

  const remove = useCallback((slug: string) => {
    setState((s) => ({ ...s, lines: s.lines.filter((l) => l.slug !== slug) }));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = state.lines.reduce((sum, l) => sum + (bySlug.get(l.slug)?.price ?? 0) * l.qty, 0);
    return {
      ...state,
      count,
      subtotal,
      isOpen,
      getProduct,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      setFulfillment: (fulfillment) => setState((s) => ({ ...s, fulfillment })),
      setGiftWrap: (giftWrap) => setState((s) => ({ ...s, giftWrap })),
      setGiftNote: (giftNote) => setState((s) => ({ ...s, giftNote: giftNote.slice(0, 240) })),
    };
  }, [state, isOpen, getProduct, bySlug, add, setQty, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
