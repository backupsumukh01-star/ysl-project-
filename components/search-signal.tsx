"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/analytics/meta";

export function SearchSignal({ query }: { query: string }) {
  useEffect(() => {
    if (query.trim().length >= 2) trackSearch(query);
  }, [query]);
  return null;
}
