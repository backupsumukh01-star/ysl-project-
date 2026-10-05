"use client";

import Link from "next/link";
import { useCart, lineKey } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import { RefPhoto } from "@/components/reference/photo";

export default function ReferenceCart() {
  const { items, ready, subtotal, shipping, total, setQuantity, removeItem } = useCart();
  return (
    <div>
      <h1 className="ref-title">Your bag</h1>
      {!ready ? <p>Loading your bag.</p> : !items.length ? (
        <p>Your bag is empty. <Link href="/reference/shop">Continue shopping</Link></p>
      ) : (
        <>
          {items.map((line) => (
            <article key={lineKey(line)} className="ref-together">
              {line.image ? <RefPhoto src={line.image} alt="" sizes="96px" ratio="96 / 120" /> : null}
              <div>
                <h2>{line.name}</h2>
                {line.variantName ? <p className="ref-muted">{line.variantName}</p> : null}
                <p>{formatMoney(line.price)}</p>
                <div className="ref-qty">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(lineKey(line), line.quantity - 1)}>−</button>
                  <span>{line.quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(lineKey(line), line.quantity + 1)}>+</button>
                </div>
                <button type="button" onClick={() => removeItem(lineKey(line))}>Remove</button>
              </div>
            </article>
          ))}
          <p>Subtotal {formatMoney(subtotal)}</p>
          <p>Shipping {shipping == null ? "Shipping calculated at checkout" : formatMoney(shipping)}</p>
          <p>Total {formatMoney(total)}</p>
          <Link className="ref-cta" href="/reference/checkout">Checkout</Link>
          <Link className="ref-ghost" href="/reference/shop">Continue shopping</Link>
        </>
      )}
    </div>
  );
}
