"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { navLinks } from "@/lib/config";
import { useCart } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { trackSearch } from "@/lib/analytics/meta";
import { api } from "@/lib/api-client";

const menuGroups = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/product/rouge-sur-mesure", label: "Device" },
      { href: "/shop#cartridges", label: "Cartridges" },
      { href: "/product/cartridge-refill", label: "Refills" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/manual", label: "How to use" },
      { href: "/app", label: "App" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Account" },
      { href: "/account/orders", label: "Orders" },
    ],
  },
] as const;

const searchItems = [
  { href: "/shop", label: "Shop Rouge Sur Mesure" },
  { href: "/product/rouge-sur-mesure", label: "Product page" },
  { href: "/about", label: "About" },
  { href: "/app", label: "App" },
  { href: "/manual", label: "How to use" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
];

const warmRoutes = [
  "/shop",
  "/product/rouge-sur-mesure",
  "/product/cartridge-refill",
  "/product/cartridge-trio-red",
  "/product/cartridge-trio-pink",
  "/product/cartridge-trio-orange",
  "/product/cartridge-trio-nude",
  "/product/cartridge-trio-warm-red",
  "/product/cartridge-trio-warm-nude",
  "/product/cartridge-trio-cool-nude",
  "/manual",
  "/app",
  "/about",
  "/faq",
  "/contact",
  "/shipping",
  "/returns",
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready, drawerOpen, openDrawer, closeDrawer } = useCart();
  const bagLabel = ready ? `Open bag, ${count} ${count === 1 ? "item" : "items"}` : "Open bag";
  const [solid, setSolid] = useState(pathname !== "/");
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState<{ href: string; label: string }[]>([]);

  useEffect(() => {
    const warm = window.setTimeout(() => {
      for (const href of warmRoutes) router.prefetch(href);
    }, 400);
    return () => window.clearTimeout(warm);
  }, [router]);

  useEffect(() => {
    const onScroll = () => setSolid(pathname !== "/" || window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    setMenu(false);
    closeDrawer();
    setSearch(false);
    setAccount(false);
  }, [pathname, closeDrawer]);

  useEffect(() => {
    const open = menu || drawerOpen || search || account;
    document.body.classList.toggle("locked", open);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        closeDrawer();
        setSearch(false);
        setAccount(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, drawerOpen, search, account, closeDrawer]);

  useEffect(() => {
    if (!search || query.trim().length < 2) {
      setProductResults([]);
      return;
    }
    const handle = window.setTimeout(() => {
      api<{ products: { slug: string; name: string }[] }>(`/api/search?q=${encodeURIComponent(query)}`)
        .then((data) => {
          setProductResults(data.products.map((item) => ({ href: `/product/${item.slug}`, label: item.name })));
          trackSearch(query);
        })
        .catch(() => setProductResults([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query, search]);

  const pageResults = searchItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const results = [...productResults, ...pageResults];

  function current(href: string) {
    if (href.includes("#")) return undefined;
    if (href === "/shop") return pathname === "/shop" || pathname.startsWith("/product") ? "page" as const : undefined;
    return pathname === href ? "page" as const : undefined;
  }

  return (
    <>
      <div className="warm-links" aria-hidden="true">
        {warmRoutes.map((href) => (
          <Link key={href} href={href} prefetch tabIndex={-1}>
            {href}
          </Link>
        ))}
      </div>
      <header className={`header ${solid ? "solid" : ""}`}>
        <button className="icon-btn mobile-only" type="button" aria-label="Open menu" onClick={() => setMenu(true)}>
          <MenuIcon />
        </button>
        <Link href="/" className="wordmark" aria-label="Rouge Sur Mesure home">
          Rouge
        </Link>
        <nav className="desktop-nav" aria-label="Primary">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={current(link.href)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-tools">
          <button className="icon-btn" type="button" aria-label="Search" onClick={() => setSearch(true)}>
            <SearchIcon />
          </button>
          <button className="icon-btn header-account" type="button" aria-label="Account" onClick={() => setAccount(true)}>
            <UserIcon />
          </button>
          <button className="icon-btn" type="button" aria-label={bagLabel} onClick={openDrawer}>
            <BagIcon />
            {count > 0 ? <span className="badge">{count}</span> : null}
          </button>
        </div>
      </header>

      {menu ? (
        <>
          <button className="overlay" aria-label="Close menu" onClick={() => setMenu(false)} />
          <nav className="menu" aria-label="Menu" role="dialog" aria-modal="true">
            <div className="menu-head">
              <Link href="/" className="wordmark" onClick={() => setMenu(false)}>
                Rouge
              </Link>
              <button className="icon-btn" type="button" aria-label="Close menu" onClick={() => setMenu(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="menu-groups">
              {menuGroups.map((group) => (
                <section key={group.title}>
                  <p>{group.title}</p>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      onClick={(event) => {
                        const [path, hash] = link.href.split("#");
                        const samePage = (path || "/") === pathname;
                        if (!samePage || !hash) return;
                        setMenu(false);
                        const target = document.getElementById(hash);
                        if (!target) return;
                        event.preventDefault();
                        window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </section>
              ))}
            </div>
          </nav>
        </>
      ) : null}

      {search ? (
        <>
          <button className="overlay" aria-label="Close search" onClick={() => setSearch(false)} />
          <div className="search" role="dialog" aria-modal="true" aria-label="Search">
            <label className="field">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
            </label>
            <ul>
              {results.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {results.length === 0 ? (
                <li className="muted">
                  No results. <Link href="/shop">Browse the shop</Link>
                </li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}

      {account ? (
        <>
          <button className="overlay" aria-label="Close account" onClick={() => setAccount(false)} />
          <div className="account" role="dialog" aria-modal="true" aria-label="Account">
            <p className="kicker">Account</p>
            <Link href="/account">Your account</Link>
            <Link href="/account/orders">Orders</Link>
            <Link href="/account/login">Sign in</Link>
            <Link href="/contact">Contact support</Link>
          </div>
        </>
      ) : null}

      <CartDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
      <path d="M1 1h16M1 6h16M1 11h16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 13.5c1.2-2.4 2.8-3.5 5-3.5s3.8 1.1 5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 5.5h9l-.8 8h-7.4l-.8-8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 5.5a2 2 0 0 1 4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
