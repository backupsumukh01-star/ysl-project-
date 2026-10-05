"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";
import type { RefOffer } from "@/lib/reference/types";
import { RefPhoto } from "@/components/reference/photo";

const pills = [
  { href: "/reference/shop", label: "All" },
  { href: "/reference/product/rouge-sur-mesure", label: "Device" },
  { href: "/reference/cartridges", label: "Cartridge trios" },
  { href: "/reference/refills", label: "Refills" },
];

export function ReferenceListing({
  title,
  products,
  current,
}: {
  title: string;
  products: RefOffer[];
  current?: string;
}) {
  const { addItem } = useCart();
  const [filters, setFilters] = useState(false);
  const [sort, setSort] = useState("name");
  const [inStock, setInStock] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    const raw = window.localStorage.getItem("rsm-ref-fav");
    setSaved(raw ? (JSON.parse(raw) as string[]) : []);
  }, []);
  function toggleSave(slug: string) {
    const next = new Set(saved);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    const list = [...next];
    window.localStorage.setItem("rsm-ref-fav", JSON.stringify(list));
    setSaved(list);
  }
  const visible = useMemo(() => {
    const next = products.filter((item) => !inStock || item.inStock);
    next.sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? 0) - (b.price ?? 0);
      if (sort === "price-desc") return (b.price ?? 0) - (a.price ?? 0);
      return a.name.localeCompare(b.name);
    });
    return next;
  }, [products, sort, inStock]);

  return (
    <div>
      <div className="ref-banner">{title}</div>
      <p className="ref-crumb"><Link href="/reference">Home</Link> / {title}</p>
      <div className="ref-pills">
        {pills.map((pill) => (
          <Link key={pill.href} href={pill.href} aria-current={current === pill.href ? "page" : undefined}>{pill.label}</Link>
        ))}
      </div>
      <div className="ref-tools">
        <button type="button" aria-expanded={filters} onClick={() => setFilters((value) => !value)}>Filters</button>
        <select aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="name">Name</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
        </select>
      </div>
      {filters ? (
        <label>
          <input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /> In stock only
        </label>
      ) : null}
      {!visible.length ? <p>No products in this group.</p> : (
        <div className="ref-grid">
          {visible.map((item) => (
            <article key={item.id || item.slug}>
              <div className="ref-card-top">
                <Link href={`/reference/product/${item.slug}`}>
                  {item.images[0] ? <RefPhoto src={item.images[0].src} alt={item.images[0].alt} sizes="50vw" /> : null}
                </Link>
                <button className="ref-heart" type="button" aria-pressed={saved.includes(item.slug)} aria-label={saved.includes(item.slug) ? "Remove favorite" : "Save favorite"} onClick={() => toggleSave(item.slug)}>
                  {saved.includes(item.slug) ? "♥" : "♡"}
                </button>
              </div>
              <Link href={`/reference/product/${item.slug}`}><h2>{item.name}</h2></Link>
              <p className="ref-muted">{item.shortDescription}</p>
              <p>{formatMoney(item.price)}</p>
              <p className="ref-muted">{item.inStock ? "Available to order" : "Out of stock"}</p>
              <button className="ref-ghost" type="button" disabled={!item.inStock || !item.id} onClick={() => addItem({
                id: item.id,
                slug: item.slug,
                name: item.name,
                price: item.price,
                sku: item.sku,
                image: item.images[0]?.src,
              })}>Add to cart</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
