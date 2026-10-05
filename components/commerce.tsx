"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartInput } from "@/components/cart-provider";
import { product } from "@/lib/product";
import { markedOriginal } from "@/lib/pricing";
import { useMoney } from "@/components/market";
import { track } from "@/lib/analytics";

export function discountOff(price: number | null | undefined, compareAt: number | null | undefined) {
  if (price == null || compareAt == null || !(compareAt > price) || compareAt <= 0) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function Price({
  amount,
  compareAt,
  compare = true,
}: {
  amount?: number | null;
  compareAt?: number | null;
  compare?: boolean;
}) {
  const money = useMoney();
  const price = amount === undefined ? product.price : amount;
  const explicit = compareAt === undefined ? product.compareAtPrice : compareAt;
  const comparePrice = !compare ? null : explicit != null && price != null && explicit > price ? explicit : markedOriginal(price);
  const off = discountOff(price, comparePrice);
  return (
    <p className="price">
      <span className="price__now">{money(price)}</span>
      {off != null && comparePrice != null ? (
        <>
          <s>{money(comparePrice)}</s>
          <span className="price__off">{off}% off</span>
        </>
      ) : null}
    </p>
  );
}

export function QuantitySelector({ value, onChange, max = 10 }: { value: number; onChange: (value: number) => void; max?: number }) {
  const limit = Math.max(1, max);
  return (
    <div className="qty" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))}>
        –
      </button>
      <span>{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(limit, value + 1))}>
        +
      </button>
    </div>
  );
}

export function AddToCartButton({ quantity = 1, full = false, item }: { quantity?: number; full?: boolean; item?: CartInput }) {
  const { addItem, acknowledgeAdd } = useCart();
  const [added, setAdded] = useState(false);
  const lock = useRef(false);
  return (
    <button
      type="button"
      className={`btn btn-gold ${full ? "btn-full" : ""} ${added ? "is-added" : ""}`}
      aria-live="polite"
      disabled={added}
      onClick={() => {
        if (lock.current) return;
        lock.current = true;
        addItem(item ? { ...item, quantity } : quantity);
        acknowledgeAdd();
        setAdded(true);
        window.setTimeout(() => {
          lock.current = false;
          setAdded(false);
        }, 700);
      }}
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}

export function BuyNowButton({ quantity = 1, full = false, item }: { quantity?: number; full?: boolean; item?: CartInput }) {
  const { addItem } = useCart();
  const router = useRouter();
  const lock = useRef(false);
  return (
    <button
      type="button"
      className={`btn btn-dark ${full ? "btn-full" : ""}`}
      onClick={() => {
        if (lock.current) return;
        lock.current = true;
        track("click_buy_now");
        addItem(item ? { ...item, quantity } : quantity);
        router.push("/checkout");
      }}
    >
      Buy now
    </button>
  );
}
