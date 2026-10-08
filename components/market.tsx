"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import { storeCurrency } from "@/lib/pricing";
import { formatMoney } from "@/lib/product";

export const COUNTRY_COOKIE = "rsm-country";
export const COUNTRY_EVENT = "rsm-country";

export type MarketState = { currency: string; rate: number; exponent: number; country: string };

const MarketContext = createContext<MarketState>({ currency: storeCurrency, rate: 1, exponent: 2, country: "" });

export function readCountryCookie() {
  if (typeof document === "undefined") return "";
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${COUNTRY_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export function rememberCountry(iso: string, name: string) {
  document.cookie = `${COUNTRY_COOKIE}=${encodeURIComponent(iso)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(COUNTRY_EVENT, { detail: name || iso }));
}

export function MarketProvider({ initial, children }: { initial: MarketState; children: ReactNode }) {
  const [market, setMarket] = useState(initial);

  useEffect(() => {
    if (market.country && !readCountryCookie()) {
      document.cookie = `${COUNTRY_COOKIE}=${encodeURIComponent(market.country)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }
  }, [market.country]);

  useEffect(() => {
    const apply = (country: string) => {
      const path = country ? `/api/market?country=${encodeURIComponent(country)}` : "/api/market";
      api<MarketState>(path)
        .then((next) => {
          if (next.currency && next.rate > 0) setMarket({ ...next, country: next.country || "" });
        })
        .catch(() => undefined);
    };
    if (!initial.country && !readCountryCookie()) apply("");
    const onCountry = (event: Event) => apply(String((event as CustomEvent<string>).detail || ""));
    window.addEventListener(COUNTRY_EVENT, onCountry);
    return () => window.removeEventListener(COUNTRY_EVENT, onCountry);
  }, [initial.country]);

  return <MarketContext.Provider value={market}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  return useContext(MarketContext);
}

export function useMoney() {
  return (usdMajor: number | null | undefined) => {
    if (usdMajor == null) return "Price to be confirmed";
    return formatMoney(usdMajor, storeCurrency);
  };
}

export function Money({ usd }: { usd: number | null | undefined }) {
  const money = useMoney();
  return <>{money(usd)}</>;
}
