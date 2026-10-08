"use client";

import { useEffect, useRef } from "react";

const TEXT = "✦ LIMITED INDIA RELEASE · LIMITED UNITS AVAILABLE ✦";

export function AnnouncementBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const copies = [0, 1, 2, 3];

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (!reduced.matches) {
        document.documentElement.style.removeProperty("--announce");
        return;
      }
      const height = bar.offsetHeight;
      if (height > 0) document.documentElement.style.setProperty("--announce", `${height}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    reduced.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", apply);
      document.documentElement.style.removeProperty("--announce");
    };
  }, []);

  return (
    <div className="announce-bar" role="region" aria-label="Store announcement" ref={barRef}>
      <div className="announce-bar__track">
        <p className="announce-bar__set">
          {copies.map((copy) => (
            <span key={copy} aria-hidden={copy === 0 ? undefined : true}>
              {TEXT}
            </span>
          ))}
        </p>
        <p className="announce-bar__set" aria-hidden="true">
          {copies.map((copy) => (
            <span key={copy}>{TEXT}</span>
          ))}
        </p>
      </div>
    </div>
  );
}
