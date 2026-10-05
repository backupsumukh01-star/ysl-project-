"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/account", "Overview"],
  ["/account/orders", "Orders"],
  ["/account/profile", "Profile"],
  ["/account/addresses", "Addresses"],
  ["/account/security", "Security"],
  ["/account/support", "Support"],
  ["/wishlist", "Wishlist"],
  ["/track-order", "Track"],
  ["/contact", "Contact"],
] as const;

export function AccountNav() {
  const pathname = usePathname();
  if (pathname === "/account/login" || pathname === "/account/verify") return null;

  return (
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
  );
}
