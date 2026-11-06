'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
import { QuantityStepper } from './QuantityStepper';

export function AddToBag({ slug, name, available }: { slug: string; name: string; available: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (!available) {
    return (
      <button type="button" className="btn btn-dark btn-block" disabled>
        Coming soon
      </button>
    );
  }

  return (
    <div className="add-to-bag">
      <QuantityStepper value={qty} onChange={setQty} label={`Quantity of ${name}`} />
      <button type="button" className="btn btn-dark btn-grow" onClick={() => add(slug, qty)}>
        Add to bag
      </button>
    </div>
  );
}
