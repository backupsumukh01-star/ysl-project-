"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, lineKey } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import { api } from "@/lib/api-client";

export default function ReferenceCheckout() {
  const { items, ready, subtotal, shipping, total } = useCart();
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ configured: boolean }>("/api/payments/config")
      .then((data) => setConfigured(data.configured))
      .catch(() => setConfigured(false));
  }, []);

  return (
    <div>
      <h1 className="ref-title">Checkout</h1>
      {!ready ? <p>Loading your bag.</p> : !items.length ? (
        <p>Your bag is empty. <Link href="/reference/shop">Continue shopping</Link></p>
      ) : (
        <>
          {items.map((line) => (
            <p key={lineKey(line)}>{line.name}{line.variantName ? ` · ${line.variantName}` : ""} · {line.quantity} · {formatMoney(line.price)}</p>
          ))}
          <p>Subtotal {formatMoney(subtotal)}</p>
          <p>Shipping {shipping == null ? "Shipping calculated at checkout" : formatMoney(shipping)}</p>
          <p>Total {formatMoney(total)}</p>
          {configured ? (
            <Link className="ref-cta" href="/checkout">Continue in secure checkout</Link>
          ) : (
            <p role="status">Payment unavailable. The payment provider is not configured. No charge is made.</p>
          )}
        </>
      )}
    </div>
  );
}
