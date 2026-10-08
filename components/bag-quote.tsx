"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { checkoutLinePayload, type CartLine } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";

export type BagQuote = {
  subtotal: number;
  discount?: number;
  shipping: number | null;
  total: number | null;
  shippingConfigured: boolean;
  currency: string;
};

export type BagShelf = {
  mrp: string | null;
  discount: string | null;
  coupon: string | null;
  saving: string | null;
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
    setQuote(null);
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
  _marketCurrency: string,
  money: (usd: number | null) => string,
  _items: { slug: string; quantity: number }[],
  usdSubtotal: number | null,
  quote: BagQuote | null,
) {
  if (quote && quote.currency !== "USD") return formatMoney(quote.subtotal, quote.currency);
  return money(usdSubtotal);
}

export function bagTotalLabel(money: (usd: number | null) => string, quote: BagQuote | null) {
  if (!quote || quote.total == null) return "";
  if (quote.currency !== "USD") return formatMoney(quote.total, quote.currency);
  return money(quote.total);
}

export function bagShelf(
  marketCurrency: string,
  money: (usd: number | null) => string,
  items: { slug: string; price: number | null; compareAt?: number | null; quantity: number }[],
  quote: { currency?: string; discount?: number } | null,
): BagShelf {
  const empty = { mrp: null, discount: null, coupon: null, saving: null };
  if (!items.length) return empty;
  const couponMajor = quote?.discount && quote.discount > 0 && (!quote.currency || quote.currency === "USD" || quote.currency === marketCurrency) ? quote.discount : 0;

  let reference = 0;
  let selling = 0;
  for (const item of items) {
    if (item.price == null) return empty;
    selling += item.price * item.quantity;
    reference += (item.compareAt != null && item.compareAt > item.price ? item.compareAt : item.price) * item.quantity;
  }
  const off = reference - selling;
  if (off <= 0 && couponMajor <= 0) return empty;
  const savingUsd = off + (quote?.currency === "USD" ? couponMajor : 0);
  return {
    mrp: off > 0 ? money(reference) : null,
    discount: off > 0 ? `−${money(off)}` : null,
    coupon: couponMajor > 0 ? `−${money(couponMajor)}` : null,
    saving: savingUsd > 0 ? money(savingUsd) : null,
  };
}

export function BagPriceList({
  shelf,
  subtotal,
  shipping,
  total,
}: {
  shelf: BagShelf;
  subtotal?: string;
  shipping: string;
  total: string;
}) {
  return (
    <div className="bag-sums">
      {shelf.mrp ? (
        <p>
          <span>Total MRP</span>
          <span>{shelf.mrp}</span>
        </p>
      ) : subtotal ? (
        <p>
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </p>
      ) : null}
      {shelf.discount ? (
        <p>
          <span>Discount</span>
          <span className="bag-sums__off">{shelf.discount}</span>
        </p>
      ) : null}
      {shelf.coupon ? (
        <p>
          <span>Coupon</span>
          <span className="bag-sums__off">{shelf.coupon}</span>
        </p>
      ) : null}
      <p>
        <span>Shipping</span>
        <span>{shipping}</span>
      </p>
      <p className="bag-sums__total">
        <span>Total</span>
        <span>{total || "—"}</span>
      </p>
      {shelf.saving ? <p className="bag-sums__saving">You&apos;re saving {shelf.saving} on this order</p> : null}
    </div>
  );
}
