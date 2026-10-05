"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { checkoutLinePayload, type CartLine } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import { indiaSubtotalMajor } from "@/lib/pricing";

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

export function bagSubtotalLabel(
  marketCurrency: string,
  money: (usd: number | null) => string,
  items: { slug: string; quantity: number }[],
  usdSubtotal: number | null,
  quote: BagQuote | null,
) {
  if (marketCurrency === "INR") {
    const listed = indiaSubtotalMajor(items);
    if (listed != null) return formatMoney(listed, "INR");
    if (quote?.currency === "INR") return formatMoney(quote.subtotal, "INR");
  }
  if (quote && quote.currency !== "USD") return formatMoney(quote.subtotal, quote.currency);
  return money(usdSubtotal);
}

export function bagTotalLabel(money: (usd: number | null) => string, quote: BagQuote | null) {
  if (!quote || quote.total == null) return "";
  if (quote.currency !== "USD") return formatMoney(quote.total, quote.currency);
  return money(quote.total);
}
