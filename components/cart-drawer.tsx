"use client";

import Link from "next/link";
import { useCart, lineKey } from "@/components/cart-provider";
import { useBagQuote } from "@/components/bag-quote";
import { lineKind, shippingChargeLabel } from "@/lib/product";
import { useMoney } from "@/components/market";
import { chosenTrios } from "@/components/set-contains";
import { Price, QuantitySelector } from "@/components/commerce";
import { CartLineImage } from "@/components/refill-mark";
import { trioDots, type TrioFamilyName } from "@/lib/trio-images";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const money = useMoney();
  const { items, ready, subtotal, setQuantity, removeItem, clear, addedNote } = useCart();
  const quote = useBagQuote(items, ready);
  const shippingKnown = quote?.shippingConfigured === true && quote.shipping != null;
  if (!open) return null;
  const count = items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <button className="overlay" aria-label="Close bag" onClick={onClose} />
      <aside className="drawer bag-drawer" role="dialog" aria-modal="true" aria-label="Bag">
        <div className="bag-sheet__head">
          <p className="bag-sheet__title">
            Bag
            {count > 0 ? <span className="bag-sheet__count">({count === 1 ? "1 item" : `${count} items`})</span> : null}
          </p>
          <button className="bag-sheet__close" type="button" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="bag-sheet__body">
          {addedNote ? <p className="drawer-note" role="status">{addedNote}</p> : null}
          {!items.length ? (
            <div className="bag-empty">
              <div className="bag-empty__copy">
                <p className="bag-empty__title">Your bag is empty.</p>
                <p className="bag-empty__note">The device, a cartridge trio, and a single refill.</p>
              </div>
              <Link className="btn btn-gold" href="/shop" onClick={onClose}>
                Shop now
              </Link>
            </div>
          ) : (
            items.map((line) => {
              const trios = chosenTrios(line.variantName);
              return (
                <article className="bag-card" key={lineKey(line)}>
                  <span className="bag-card__shot">
                    <CartLineImage slug={line.slug} image={line.image} size={88} />
                  </span>
                  <div className="bag-card__main">
                    <div className="bag-card__top">
                      <h2>{line.name}</h2>
                      <Price amount={line.price} compareAt={line.compareAt} />
                    </div>
                    {trios.length === 3 ? null : lineKind(line.sku) ? <p className="bag-card__kind">{lineKind(line.sku)}</p> : null}
                    {trios.length === 3 ? null : line.slug === "rouge-sur-mesure" ? (
                      <p className="bag-card__kind"><Link href="/product/rouge-sur-mesure#trios" onClick={onClose}>Choose any 3 trios</Link></p>
                    ) : line.variantName ? (
                      <p className="bag-card__kind">{line.variantName}</p>
                    ) : null}
                    <button className="bag-card__remove" type="button" onClick={() => removeItem(lineKey(line))}>
                      Remove
                    </button>
                  </div>
                  {trios.length === 3 ? <BagSet trios={trios} /> : null}
                  <div className="bag-card__tools">
                    <QuantitySelector value={line.quantity} onChange={(quantity) => setQuantity(lineKey(line), quantity)} />
                  </div>
                </article>
              );
            })
          )}
        </div>
        {items.length ? (
          <div className="bag-sheet__foot">
            <div className="bag-sheet__sums">
              <p>
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </p>
              <p>
                <span>Shipping</span>
                <span>{!quote ? "Confirming" : shippingKnown ? shippingChargeLabel(quote.shipping) : "Not published"}</span>
              </p>
              <p className="bag-sheet__total">
                <span>Total</span>
                <span>{shippingKnown && quote ? money(quote.total) : "—"}</span>
              </p>
            </div>
            {quote && !shippingKnown ? <p className="bag-sheet__wait">Checkout stays closed until a shipping price is set.</p> : null}
            <Link className="btn btn-gold btn-full" href="/checkout" onClick={onClose}>
              Checkout
            </Link>
            <p className="bag-sheet__links">
              <Link href="/cart" onClick={onClose}>View bag</Link>
              <Link href="/shop" onClick={onClose}>Continue shopping</Link>
              {items.length > 1 ? (
                <button type="button" onClick={clear}>Remove all</button>
              ) : null}
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function BagSet({ trios }: { trios: TrioFamilyName[] }) {
  return (
    <ul className="bag-set" aria-label="This set contains">
      <li>
        <span className="bag-set__swatch bag-set__swatch--device is-selected" aria-hidden="true" />
        <span>Device</span>
      </li>
      {trios.map((family, index) => (
        <li key={`${family}-${index}`}>
          <span className="bag-set__swatch is-selected" aria-hidden="true">
            {trioDots[family].map((color) => (
              <i key={color} style={{ background: color }} />
            ))}
          </span>
          <span>{family}</span>
        </li>
      ))}
    </ul>
  );
}
