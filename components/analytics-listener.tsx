"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureVisit } from "@/lib/analytics/browser";
import { trackPageViewOnce } from "@/lib/analytics/meta";

export function AnalyticsListener() {
  const pathname = usePathname();
  const search = useSearchParams();
  const key = `${pathname}?${search.toString()}`;
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    captureVisit();
    const send = () => trackPageViewOnce(keyRef.current);
    send();
    window.addEventListener("rsm-consent", send);
    return () => window.removeEventListener("rsm-consent", send);
  }, [key]);

  return null;
}
