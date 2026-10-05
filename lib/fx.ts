import { Country } from "country-state-city";

/** Currencies Razorpay can charge. Anything else stays in US dollars. */
const CHARGEABLE = new Set([
  "AED", "ALL", "AMD", "ARS", "AUD", "AWG", "BBD", "BDT", "BMD", "BND", "BOB", "BSD", "BWP", "BZD",
  "CAD", "CHF", "CNY", "COP", "CRC", "CZK", "DKK", "DOP", "DZD", "EGP", "ETB", "EUR", "FJD", "GBP",
  "GHS", "GTQ", "HKD", "HNL", "HUF", "IDR", "ILS", "INR", "JMD", "JPY", "KES", "KHR", "KRW", "KZT",
  "LKR", "MAD", "MDL", "MUR", "MXN", "MYR", "NGN", "NOK", "NPR", "NZD", "PEN", "PHP", "PKR",
  "QAR", "SAR", "SEK", "SGD", "THB", "TTD", "TZS", "UAH", "USD", "UYU", "VND", "XAF",
  "XOF", "ZAR",
]);

const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
const THREE_DECIMAL = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

const FALLBACK: Record<string, number> = {
  USD: 1,
  INR: 96.4,
  EUR: 0.889,
  GBP: 0.756,
  AED: 3.673,
  AUD: 1.439,
  CAD: 1.425,
  SGD: 1.279,
  JPY: 157.73,
  CHF: 0.828,
  HKD: 7.848,
  NZD: 1.781,
  SEK: 10.04,
  NOK: 9.62,
  DKK: 6.647,
  MYR: 4.085,
  THB: 33.57,
  ZAR: 16.66,
  SAR: 3.75,
  QAR: 3.64,
  CNY: 6.71,
  KRW: 1344.61,
  PHP: 62.63,
  IDR: 17915,
  MXN: 18.19,
  PLN: 3.896,
  CZK: 21.73,
  HUF: 327.67,
  TRY: 49.16,
  ILS: 3.045,
  PKR: 277.49,
};

export type Market = {
  currency: string;
  rate: number;
  exponent: number;
};

let cached: { at: number; rates: Record<string, number> } | null = null;

export function currencyExponent(currency: string) {
  if (ZERO_DECIMAL.has(currency)) return 0;
  if (THREE_DECIMAL.has(currency)) return 3;
  return 2;
}

export function placeFor(countryOrIso: string | undefined | null): { iso: string; currency: string } {
  const text = (countryOrIso || "").trim();
  if (!text) return { iso: "", currency: "USD" };
  const rows = Country.getAllCountries();
  const match =
    rows.find((row) => row.isoCode.toLowerCase() === text.toLowerCase()) ||
    rows.find((row) => row.name.toLowerCase() === text.toLowerCase());
  const code = (match?.currency || "USD").toUpperCase();
  return { iso: match?.isoCode || "", currency: CHARGEABLE.has(code) ? code : "USD" };
}

export function currencyForPlace(countryOrIso: string | undefined | null): string {
  return placeFor(countryOrIso).currency;
}

async function usdRates(): Promise<Record<string, number>> {
  if (cached && Date.now() - cached.at < 6 * 60 * 60 * 1000) return cached.rates;
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 21600 } });
    const body = (await response.json()) as { result?: string; rates?: Record<string, number> };
    if (response.ok && body.result === "success" && body.rates) {
      cached = { at: Date.now(), rates: { ...FALLBACK, ...body.rates, USD: 1 } };
      return cached.rates;
    }
  } catch {
    /* Use the stored rates when the rate service is unreachable. */
  }
  return { ...FALLBACK, ...(cached?.rates || {}) };
}

export async function marketFor(countryOrIso: string | undefined | null): Promise<Market> {
  const currency = currencyForPlace(countryOrIso);
  if (currency === "USD") return { currency: "USD", rate: 1, exponent: 2 };
  const rates = await usdRates();
  const rate = rates[currency];
  if (!rate || rate <= 0) return { currency: "USD", rate: 1, exponent: 2 };
  return { currency, rate, exponent: currencyExponent(currency) };
}

export function convertUsdMinor(usdMinor: number, market: Market) {
  if (market.currency === "USD" || market.rate === 1) return usdMinor;
  return Math.round((usdMinor / 100) * market.rate * 10 ** market.exponent);
}

export function fromMinor(minor: number | null | undefined, currency: string): number | null {
  if (minor == null) return null;
  return minor / 10 ** currencyExponent(currency);
}
