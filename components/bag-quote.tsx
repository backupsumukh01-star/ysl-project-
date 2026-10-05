"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { checkoutLinePayload, type CartLine } from "@/components/cart-provider";

export type BagQuote = {
  subtotal: number;
  shipping: number | null;
  total: number | null;
  shippingConfigured: boolean;
  currency: string;
};

export function useBagQuote(items: CartLine[], ready: boolean) {
  const [quote, setQuote] = useState<BagQuote | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const signature = items.map((item) => `${item.id}:${item.variantId || ""}:${item.quantity}`).join("|");

  useEffect(() => {
    const current = itemsRef.current;
    if (!ready || !current.length) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    api<BagQuote>("/api/checkout/quote", {
      method: "POST",
      body: JSON.stringify({
        lines: checkoutLinePayload(current),
      }),
    })
      .then((result) => {
        if (!cancelled) setQuote(result);
      })
      .catch(() => {
        if (!cancelled) setQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, signature]);

  return quote;
}
