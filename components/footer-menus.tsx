"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterGroup = {
  title: string;
  links: { href: string; label: string }[];
};

export function FooterMenus({ groups }: { groups: FooterGroup[] }) {
  const pathname = usePathname();
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return null;

  return (
    <>
      <div className="footer-links">
        {groups.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-folds">
        {groups.map((group) => (
          <details key={group.title}>
            <summary>{group.title}</summary>
            <div className="fold">
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
