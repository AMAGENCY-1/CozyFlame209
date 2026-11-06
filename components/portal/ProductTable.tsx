'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { type Product, type ProductStatus, statusLabels } from '@/lib/catalog';
import { PlusIcon, SearchIcon } from '../icons';
import { ProductRow } from './ProductRow';
import { Toast } from './ui';

type Filter = 'all' | ProductStatus;
const filters: Filter[] = ['all', 'live', 'coming-soon', 'hidden'];

export function ProductTable({ products, deletedName }: { products: Product[]; deletedName: string | null }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: products.length, live: 0, 'coming-soon': 0, hidden: 0 };
    for (const p of products) c[p.status] += 1;
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (filter === 'all' || p.status === filter) &&
        (!q || p.name.toLowerCase().includes(q) || p.notes.some((n) => n.toLowerCase().includes(q))),
    );
  }, [products, filter, query]);

  return (
    <section className="s-panel" aria-label="Product list">
      <Toast message={deletedName ? `${deletedName} was deleted.` : null} />
      <div className="list-tools">
        <div className="filter-tabs" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : statusLabels[f]}
              <span className="count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="visually-hidden">Search products</span>
          <SearchIcon width={18} height={18} />
          <input
            id="product-search"
            className="s-input"
            type="search"
            placeholder="Search by name or scent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {visible.length ? (
        <ul className="product-list">
          {visible.map((p) => (
            <li key={p.slug}>
              <ProductRow product={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="list-empty">
          <p>{products.length ? 'No products match.' : 'Your shelf is empty.'}</p>
          {!products.length && (
            <Link href="/portal/products/new" className="s-btn s-btn-primary">
              <PlusIcon width={16} height={16} /> Add your first product
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
