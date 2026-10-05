"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function StickyBuyBar({
  device,
}: {
  device?: { id: string; slug: string; name: string; price: number | null; image?: string; sku?: string } | null;
}) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.querySelector("#purchase .actions");
    if (!target) {
      const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const footer = document.querySelector("footer");
    let purchaseAway = false;
    let footerVisible = false;
    const update = () => setShow(purchaseAway && !footerVisible);
    const purchaseObserver = new IntersectionObserver(([entry]) => {
      purchaseAway = !entry.isIntersecting && entry.boundingClientRect.top < 80;
      update();
    });
    purchaseObserver.observe(target);
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => {
          footerVisible = entry.isIntersecting;
          update();
        })
      : null;
    if (footer) footerObserver?.observe(footer);
    return () => {
      purchaseObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [pathname]);

  if (pathname !== "/product/rouge-sur-mesure" || !show) return null;

  return (
    <div className="sticky-buy">
      <p>{device?.name || "Rouge Sur Mesure"}</p>
      <Link className="btn btn-gold" href="/product/rouge-sur-mesure#trios">Choose 3 trios</Link>
    </div>
  );
}

export function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button className="to-top" type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span aria-hidden="true">↑</span>
    </button>
  );
}

export function HelpLink() {
  return (
    <Link className="help" href="/contact">
      Need help?
    </Link>
  );
}
