"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useCart } from "@/components/cart-provider";
import "../quiet.css";

type Item = { id: string; variantId: string; slug: string; name: string; active: boolean };

export default function WishlistPage() {
  const { addItem, openDrawer } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    const local = readLocal();
    api<{ items: Item[] }>("/api/wishlist")
      .then((result) => setItems(result.items.length ? result.items : local))
      .catch(() => setItems(local));
  }, []);

  function remove(id: string, variantId: string) {
    const next = items.filter((item) => !(item.id === id && item.variantId === variantId));
    setItems(next);
    writeLocal(next);
    api("/api/wishlist", { method: "PUT", body: JSON.stringify({ items: next.map((item) => ({ productId: item.id, variantId: item.variantId })) }) }).catch(() => setNote("Saved on this device. Sign in to keep it on the account."));
  }

  return (
    <main id="main" className="page quiet-page">
      <p className="kicker">Wishlist</p>
      <h1>Wishlist</h1>
      {!items.length ? (
        <div className="quiet-empty">
          <p>Nothing saved yet.</p>
          <Link className="btn btn-gold" href="/shop">Continue shopping</Link>
        </div>
      ) : null}
      {items.map((item) => (
        <article className="wish-line" key={`${item.id}-${item.variantId}`}>
          <h2>{item.name}</h2>
          <div className="actions">
            {item.active ? (
              <button className="btn btn-gold" type="button" onClick={() => { addItem({ id: item.id, slug: item.slug, name: item.name, price: null, variantId: item.variantId }); openDrawer(); }}>
                Move to bag
              </button>
            ) : <p>Unavailable</p>}
            <button className="btn btn-ghost" type="button" onClick={() => remove(item.id, item.variantId)}>Remove</button>
            <Link href={`/product/${item.slug}`}>View</Link>
          </div>
        </article>
      ))}
      {note ? <p className="form-note">{note}</p> : null}
    </main>
  );
}

function readLocal(): Item[] {
  try {
    return JSON.parse(localStorage.getItem("rsm-wishlist") || "[]") as Item[];
  } catch {
    return [];
  }
}

function writeLocal(items: Item[]) {
  localStorage.setItem("rsm-wishlist", JSON.stringify(items));
}
