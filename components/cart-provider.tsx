"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { product } from "@/lib/product";
import { cartridgePhotoSrc } from "@/lib/cartridge-photos";
import { siteConfig } from "@/lib/config";
import { catalogCompareForSlug, catalogMajorForSlug, metaLineAmount } from "@/lib/pricing";
import { useMarket } from "@/components/market";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics/meta";
import { api } from "@/lib/api-client";

const STORAGE_KEY = "rsm-cart";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  variantId: string;
  variantName: string;
  sku: string;
  price: number | null;
  compareAt?: number | null;
  image: string;
};

export type CartInput = {
  id: string;
  slug: string;
  name: string;
  quantity?: number;
  variantId?: string;
  variantName?: string;
  sku?: string;
  price: number | null;
  compareAt?: number | null;
  image?: string;
};

type CartContextValue = {
  items: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number | null;
  shipping: number | null;
  total: number | null;
  addItem: (input?: number | CartInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  addedNote: string;
  openDrawer: () => void;
  closeDrawer: () => void;
  acknowledgeAdd: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function checkoutLinePayload(items: Pick<CartLine, "id" | "variantId" | "quantity" | "variantName">[]) {
  return items.map((item) => ({
    productId: item.id,
    variantId: item.variantId || undefined,
    quantity: item.quantity,
    selection: item.variantName || undefined,
  }));
}

export function lineKey(item: { id: string; variantId?: string; variantName?: string }) {
  return `${item.id}::${item.variantId || ""}::${item.variantName || ""}`;
}

function defaultLine(quantity = 1): CartLine {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    quantity,
    variantId: "",
    variantName: "",
    sku: "",
    price: product.price,
    image: product.images.showcase.src,
  };
}

function catalogPrice(slug: string, id: string, fallback: number | null) {
  return catalogMajorForSlug(slug) ?? catalogMajorForSlug(id) ?? fallback;
}

function normalize(input: number | CartInput | undefined): CartLine {
  if (typeof input === "number" || input == null) return defaultLine(typeof input === "number" ? input : 1);
  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    quantity: Math.min(10, Math.max(1, Math.floor(input.quantity || 1))),
    variantId: input.variantId || "",
    variantName: input.variantName || "",
    sku: input.sku || "",
    price: catalogPrice(input.slug, input.id, input.price),
    compareAt: catalogCompareForSlug(input.slug) ?? input.compareAt ?? null,
    image: input.slug === "cartridge-refill" ? cartridgePhotoSrc(input.variantName) || input.image || "" : input.image || product.images.showcase.src,
  };
}

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const line = item as Partial<CartLine>;
      if (!line.id || typeof line.quantity !== "number") return [];
      const known = line.id === product.id;
      return [{
        id: line.id,
        slug: line.slug || (known ? product.slug : line.id),
        name: line.name || (known ? product.name : "Product"),
        quantity: Math.min(10, Math.max(1, Math.floor(line.quantity))),
        variantId: line.variantId || "",
        variantName: line.variantName || "",
        sku: line.sku || "",
        price: catalogPrice(line.slug || "", line.id, typeof line.price === "number" || line.price === null ? line.price : known ? product.price : null),
        compareAt: catalogCompareForSlug(line.slug || (known ? product.slug : "")) ?? (typeof line.compareAt === "number" ? line.compareAt : null),
        image: (line.slug || "") === "cartridge-refill" ? cartridgePhotoSrc(line.variantName) || line.image || "" : line.image || (known ? product.images.showcase.src : "/images/showcase.png"),
      }];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addedNote, setAddedNote] = useState("");
  const noteTimer = useRef<number | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setAddedNote("");
  }, []);
  const acknowledgeAdd = useCallback(() => {
    setAddedNote("Added to your bag.");
    setDrawerOpen(true);
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setAddedNote(""), 4000);
  }, []);

  useLayoutEffect(() => {
    const local = readStored();
    if (!local.length) return;
    setItems((current) => (current.length ? current : local));
  }, []);

  useEffect(() => {
    let cancel = false;
    const local = itemsRef.current.length ? itemsRef.current : readStored();
    const seeded = JSON.stringify(local);
    api<{ user: { id: string } | null }>("/api/auth/session")
      .then(async (session) => {
        if (!session.user) return local;
        if (!cancel) setSignedIn(true);
        const saved = await api<{ items: CartLine[] }>("/api/cart");
        if (saved.items.length) return saved.items;
        if (!local.length) return local;
        const replaced = await api<{ items: CartLine[] }>("/api/cart", {
          method: "PUT",
          body: JSON.stringify({ items: checkoutLinePayload(local) }),
        });
        return replaced.items.length ? replaced.items : local;
      })
      .catch(() => local)
      .then((next) => {
        if (cancel) return;
        setItems((current) => (!current.length || JSON.stringify(current) === seeded ? next : current));
        setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const priceKey = items.map((item) => `${item.id}:${item.variantId}:${item.variantName}:${item.quantity}`).join("|");

  useEffect(() => {
    if (!ready || !itemsRef.current.length) return;
    const signature = priceKey;
    let cancel = false;
    api<{ currency?: string; lines?: { productId: string; variantId: string; variantName: string; unit: number | null }[] }>("/api/checkout/quote", {
      method: "POST",
      body: JSON.stringify({
        lines: checkoutLinePayload(itemsRef.current),
      }),
    })
      .then((result) => {
        if (cancel || !result.lines || (result.currency && result.currency !== "USD")) return;
        setItems((current) => {
          const now = current.map((item) => `${item.id}:${item.variantId}:${item.variantName}:${item.quantity}`).join("|");
          if (now !== signature) return current;
          let changed = false;
          const next = current.map((item) => {
            const match = result.lines?.find((line) => line.productId === item.id && (line.variantId || "") === (item.variantId || "") && (line.variantName || "") === (item.variantName || ""));
            if (!match || match.unit == null || item.price === match.unit) return item;
            changed = true;
            return { ...item, price: match.unit };
          });
          return changed ? next : current;
        });
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [ready, priceKey]);

  useEffect(() => {
    if (!ready || !signedIn) return;
    const handle = window.setTimeout(() => {
      api("/api/cart", {
        method: "PUT",
        body: JSON.stringify({
          items: checkoutLinePayload(items),
        }),
      }).catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [items, ready, signedIn]);

  const market = useMarket();
  const addItem = useCallback((input?: number | CartInput) => {
    const line = normalize(input);
    if (!line.id || line.quantity < 1) return;
    setItems((current) => {
      const existing = current.find((item) => lineKey(item) === lineKey(line));
      const quantity = Math.min(10, (existing?.quantity || 0) + line.quantity);
      const next = { ...line, quantity };
      return existing ? current.map((item) => (lineKey(item) === lineKey(line) ? next : item)) : [...current, next];
    });
    const money = metaLineAmount(line.price, market.currency);
    trackAddToCart({
      contentIds: [line.id],
      contentName: line.name,
      quantity: line.quantity,
      currency: money.currency,
      ...(money.value != null ? { value: money.value * line.quantity } : {}),
    });
  }, [market.currency]);

  const removeItem = useCallback((key: string) => {
    const found = itemsRef.current.find((item) => lineKey(item) === key);
    if (!found) return;
    const money = metaLineAmount(found.price, market.currency);
    trackRemoveFromCart({
      contentIds: [found.id],
      contentName: found.name,
      quantity: found.quantity,
      currency: money.currency,
      ...(money.value != null ? { value: money.value * found.quantity } : {}),
    });
    setItems((current) => current.filter((item) => lineKey(item) !== key));
  }, [market.currency]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    const next = Math.floor(quantity);
    setItems((current) => {
      if (next < 1) return current.filter((item) => lineKey(item) !== key);
      return current.map((item) => (lineKey(item) === key ? { ...item, quantity: Math.min(10, next) } : item));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const priced = items.every((item) => item.price != null);
  const subtotal = !items.length || !priced ? null : items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const shipping = count === 0 ? null : siteConfig.shippingFlat;
  const total = subtotal == null ? null : subtotal + (shipping ?? 0);

  const value = useMemo(
    () => ({ items, ready, count, subtotal, shipping, total, addItem, removeItem, setQuantity, clear, drawerOpen, addedNote, openDrawer, closeDrawer, acknowledgeAdd }),
    [items, ready, count, subtotal, shipping, total, addItem, removeItem, setQuantity, clear, drawerOpen, addedNote, openDrawer, closeDrawer, acknowledgeAdd],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
