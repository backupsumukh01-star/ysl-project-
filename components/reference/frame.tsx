"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { useCart, lineKey } from "@/components/cart-provider";
import { formatMoney } from "@/lib/product";

type RefSearchHit = { slug: string; name: string; price: number | null; haystack: string };

const shopLinks = [
  { href: "/reference/shop", label: "Shop" },
  { href: "/reference/product/rouge-sur-mesure", label: "Device" },
  { href: "/reference/cartridges", label: "Cartridges" },
  { href: "/reference/refills", label: "Refills" },
  { href: "/reference/product/rouge-sur-mesure#how", label: "How it works" },
  { href: "/reference/product/rouge-sur-mesure#colors", label: "Colors" },
  { href: "/reference/product/rouge-sur-mesure#app", label: "App" },
  { href: "/reference/faq", label: "FAQ" },
  { href: "/contact", label: "Support" },
];

export function ReferenceFrame({ children, catalog }: { children: React.ReactNode; catalog: RefSearchHit[] }) {
  const pathname = usePathname();
  const { count, items, subtotal, shipping, total, setQuantity, removeItem, drawerOpen, openDrawer, closeDrawer } = useCart();
  const [menu, setMenu] = useState(false);
  const [makeup, setMakeup] = useState(true);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const needle = query.trim().toLowerCase();
  const results = needle.length < 2 ? [] : catalog.filter((item) => item.haystack.includes(needle)).slice(0, 8);
  const contacts = siteConfig.referenceContacts;

  useEffect(() => {
    setMenu(false);
    closeDrawer();
    setQuery("");
  }, [pathname, closeDrawer]);

  useEffect(() => {
    const open = menu || drawerOpen;
    document.body.classList.toggle("locked", open);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        closeDrawer();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, drawerOpen, closeDrawer]);

  function onJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setNote("Newsletter signup is not connected, so this address was not saved.");
  }

  return (
    <div className="ref-shell">
      <header className="ref-top">
        <div className="ref-bar">
          <Link className="ref-icon" href={contacts.findStoreHref || "/contact"} aria-label="Find a store">
            <PinIcon />
          </Link>
          <Link href="/reference" className="ref-brand">Rouge</Link>
          <button className="ref-icon" type="button" aria-label={`Bag, ${count} items`} onClick={openDrawer}>
            <BagIcon />
            {count > 0 ? <span className="ref-badge">{count}</span> : null}
          </button>
          <button className="ref-icon" type="button" aria-label="Open menu" onClick={() => setMenu(true)}>
            <MenuIcon />
          </button>
        </div>
        <form className="ref-search" action="/reference/shop" role="search">
          <input id="ref-q" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the catalog" aria-label="Search the catalog" />
          {query ? (
            <button className="ref-icon" type="button" aria-label="Clear search" onClick={() => setQuery("")}>Clear</button>
          ) : null}
          <button className="ref-icon" type="submit" aria-label="Submit search">
            <SearchIcon />
          </button>
        </form>
        {query.trim().length >= 2 ? (
          <div className="ref-results" role="listbox" aria-label="Search results">
            {results.length ? results.map((item) => (
              <Link key={item.slug} href={`/reference/product/${item.slug}`}>
                {item.name} · {formatMoney(item.price)}
              </Link>
            )) : <p className="ref-muted" style={{ padding: 16 }}>No catalog matches.</p>}
          </div>
        ) : null}
      </header>
      <div className="ref-main">{children}</div>
      <footer className="ref-foot">
        <div className="ref-foot-grid">
          <div>
            <p className="ref-h" style={{ color: "#fff" }}>Newsletter</p>
            <form onSubmit={onJoin}>
              <label>
                <span className="ref-muted" style={{ color: "#ddd" }}>Email</span>
                <input name="email" type="email" required autoComplete="email" />
              </label>
              <button className="ref-cta" type="submit">Submit</button>
            </form>
            {note ? <p role="status">{note}</p> : null}
          </div>
          <div>
            <p className="ref-h" style={{ color: "#fff" }}>Customer care</p>
            <Link className="ref-foot-link" href="/reference/faq">FAQ</Link>
            <Link className="ref-foot-link" href="/shipping">Shipping</Link>
            <Link className="ref-foot-link" href="/returns">Returns</Link>
            <Link className="ref-foot-link" href="/contact">Support</Link>
            <p className="ref-h" style={{ color: "#fff", marginTop: 24 }}>Contact</p>
            {contacts.findStoreHref ? (
              <a className="ref-foot-link" href={contacts.findStoreHref}>{contacts.findStoreLabel}</a>
            ) : (
              <p className="ref-foot-link">{contacts.findStoreLabel} · not configured</p>
            )}
            <Link className="ref-foot-link" href={contacts.contactHref}>{contacts.contactLabel}</Link>
            <p className="ref-foot-link">{contacts.phoneLabel}</p>
            {contacts.chatHref ? (
              <a className="ref-foot-link" href={contacts.chatHref}>{contacts.chatLabel}</a>
            ) : (
              <p className="ref-foot-link">{contacts.chatLabel} · not configured</p>
            )}
            <p style={{ marginTop: 16 }}>
              <Link href="/privacy">Privacy</Link>
              {" · "}
              <Link href="/terms">Terms</Link>
              {" · "}
              <Link href="/risk-disclosure">Risk disclosure</Link>
            </p>
            {Object.entries(siteConfig.social).filter(([, href]) => href).length ? (
              <p>
                {Object.entries(siteConfig.social).filter(([, href]) => href).map(([name, href]) => (
                  <a key={name} href={href} style={{ marginRight: 12 }}>{name}</a>
                ))}
              </p>
            ) : <p className="ref-muted" style={{ color: "#bbb" }}>Social profiles are not configured.</p>}
          </div>
        </div>
      </footer>

      {menu ? (
        <>
          <button className="ref-overlay" aria-label="Close menu" onClick={() => setMenu(false)} />
          <nav className="ref-drawer ref-nav" aria-label="Menu" role="dialog" aria-modal="true">
            <button className="ref-icon" type="button" aria-label="Close menu" onClick={() => setMenu(false)}>Close</button>
            <button className="ref-nav-btn" type="button" aria-expanded={makeup} onClick={() => setMakeup((value) => !value)}>
              Makeup <span>{makeup ? "−" : "+"}</span>
            </button>
            {makeup ? (
              <div className="ref-sub">
                <Link href="/reference/shop">Lip</Link>
                <Link href="/reference/product/rouge-sur-mesure" aria-current={pathname === "/reference/product/rouge-sur-mesure" ? "page" : undefined}>Custom lip creator</Link>
              </div>
            ) : null}
            {shopLinks.map((link) => {
              const path = link.href.split("#")[0];
              const hashed = link.href.includes("#");
              return (
                <Link key={link.href} href={link.href} aria-current={!hashed && pathname === path ? "page" : undefined} onClick={() => setMenu(false)}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}

      {drawerOpen ? (
        <>
          <button className="ref-overlay" aria-label="Close bag" onClick={closeDrawer} />
          <aside className="ref-bag" role="dialog" aria-modal="true" aria-label="Bag">
            <button className="ref-icon" type="button" aria-label="Close bag" onClick={closeDrawer}>Close</button>
            <h2 className="ref-h-strong">Your bag</h2>
            {!items.length ? <p>Your bag is empty.</p> : items.map((line) => (
              <article key={lineKey(line)} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, marginBottom: 16 }}>
                {line.image ? <Image src={line.image} alt="" width={72} height={96} unoptimized={line.image.endsWith(".svg")} style={{ objectFit: "contain", background: "#fafafa", width: 72, height: 96 }} /> : null}
                <div>
                  <p>{line.name}</p>
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
            <Link className="ref-cta" href="/reference/checkout" onClick={closeDrawer}>Checkout</Link>
            <Link className="ref-ghost" href="/reference/shop" onClick={closeDrawer}>Continue shopping</Link>
          </aside>
        </>
      ) : null}
    </div>
  );
}

function PinIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function BagIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function MenuIcon() {
  return <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
