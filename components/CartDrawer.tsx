'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { PLACEHOLDER_IMAGE } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import { useCart, type Fulfillment } from './CartProvider';
import { CloseIcon } from './icons';
import { QuantityStepper } from './QuantityStepper';

const fulfillmentOptions: { value: Fulfillment; label: string; detail: string }[] = [
  { value: 'pickup', label: 'Pickup in the 209', detail: 'Pickup details arrive with your confirmation' },
  { value: 'delivery', label: 'Local delivery', detail: 'Zones and fees confirmed at checkout' },
  { value: 'shipping', label: 'Ship within California', detail: 'Shipped early in the week to beat the heat' },
];

export function CartDrawer() {
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cart.isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cart.close();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [cart.isOpen, cart.close]);

  return (
    <div className="drawer-root" data-open={cart.isOpen} aria-hidden={!cart.isOpen}>
      <div className="drawer-overlay" onClick={cart.close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" inert={!cart.isOpen}>
        <div className="drawer-head">
          <h2 id="bag-title">Your bag</h2>
          <button ref={closeRef} type="button" className="icon-button" onClick={cart.close} aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Your bag is empty.</p>
            <Link href="/shop" className="btn btn-dark" onClick={cart.close}>
              Shop candles
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer-body">
            <ul className="bag-lines">
              {cart.lines.map((line) => {
                const product = cart.getProduct(line.slug);
                if (!product || product.price === null) return null;
                return (
                  <li key={line.slug} className="bag-line">
                    <Image
                      src={product.image || PLACEHOLDER_IMAGE}
                      alt=""
                      width={96}
                      height={120}
                      className="bag-thumb"
                      unoptimized={product.image.startsWith('/uploads/')}
                    />
                    <div className="bag-line-body">
                      <div className="bag-line-top">
                        <Link href={`/products/${product.slug}`} onClick={cart.close} className="bag-line-name">
                          {product.name}
                        </Link>
                        <span className="price">{formatPrice(product.price * line.qty)}</span>
                      </div>
                      <p className="bag-line-notes">{product.notes.join(' · ')}</p>
                      <div className="bag-line-actions">
                        <QuantityStepper
                          value={line.qty}
                          onChange={(q) => cart.setQty(line.slug, q)}
                          label={`Quantity of ${product.name}`}
                          small
                        />
                        <button type="button" className="text-button" onClick={() => cart.remove(line.slug)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="drawer-section">
              <fieldset className="fulfillment">
                <legend>How would you like it?</legend>
                {fulfillmentOptions.map((opt) => (
                  <label key={opt.value} className="radio-card">
                    <input
                      type="radio"
                      id={`fulfillment-${opt.value}`}
                      name="fulfillment"
                      value={opt.value}
                      checked={cart.fulfillment === opt.value}
                      onChange={() => cart.setFulfillment(opt.value)}
                    />
                    <span>
                      <strong>{opt.label}</strong>
                      <small>{opt.detail}</small>
                    </span>
                  </label>
                ))}
              </fieldset>

              <label className="checkbox">
                <input id="gift-wrap" type="checkbox" checked={cart.giftWrap} onChange={(e) => cart.setGiftWrap(e.target.checked)} />
                <span>Gift wrap this order</span>
              </label>
              <label className="field">
                <span>Gift note (optional)</span>
                <textarea
                  id="gift-note"
                  rows={2}
                  maxLength={240}
                  placeholder="A few words for the card"
                  value={cart.giftNote}
                  onChange={(e) => cart.setGiftNote(e.target.value)}
                />
              </label>
            </div>
            </div>

            <div className="drawer-foot">
              <div className="subtotal">
                <span>Subtotal</span>
                <span className="price">{formatPrice(cart.subtotal)}</span>
              </div>
              <button type="button" className="btn btn-dark btn-block" disabled aria-describedby="checkout-note">
                Checkout
              </button>
              <p id="checkout-note" className="fine-print">
                Preview only: checkout connects to Shopify at launch, so no payment is taken here.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
