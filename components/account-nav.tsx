"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/profile", "Profile"],
  ["/account/addresses", "Addresses"],
  ["/account/support", "Support"],
  ["/account/security", "Security"],
  ["/wishlist", "Wishlist"],
  ["/track-order", "Track an order"],
] as const;

const barePaths = new Set(["/account/login", "/account/verify", "/account/reset"]);

export function AccountFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [who, setWho] = useState<{ name: string; email: string } | null>(null);
  const bare = barePaths.has(pathname);

  useEffect(() => {
    if (bare) return;
    api<{ user: { email: string; name: string } | null }>("/api/auth/session")
      .then((result) => setWho(result.user ? { name: result.user.name, email: result.user.email } : null))
      .catch(() => setWho(null));
  }, [bare, pathname]);

  if (bare) return <>{children}</>;

  async function onLogout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="account-panel">
      <aside className="account-panel__side">
        <p className="kicker">Account</p>
        {who ? <p className="account-panel__who">{who.name || "Your account"}</p> : null}
        {who?.email ? <p className="account-panel__mail">{who.email}</p> : null}
        <nav className="account-nav" aria-label="Account">
          {links.map(([href, label]) => {
            const current = href === "/account" ? pathname === "/account" : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-current={current ? "page" : undefined}>
                {label}
              </Link>
            );
          })}
        </nav>
        {who ? (
          <button className="account-logout" type="button" onClick={() => void onLogout()}>
            Log out
          </button>
        ) : null}
      </aside>
      <div className="account-panel__main">{children}</div>
    </div>
  );
}
