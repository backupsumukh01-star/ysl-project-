import prices from "@/lib/catalog-prices.json";

export const publishedPrices = prices;

/** Charge, display, and ad currency. Dollar figures in the catalog file stay unused. */
export const storeCurrency = "INR";

export function publishedMajor(type: string): number | null {
  return indiaMajorForType(type);
}

export function publishedCompareMajor(type: string): number | null {
  return indiaCompareForType(type);
}

export function publishedMinor(type: string): number | null {
  const major = publishedMajor(type);
  return major == null ? null : Math.round(major * 100);
}

/** Catalog price wins over a stored or browser price for the published product types. */
export function authoritativeMinor(type: string, stored?: number | null): number | null {
  const catalog = publishedMinor(type);
  if (catalog != null) return catalog;
  return stored ?? null;
}

/** Whole percent off the reference price. Null when this product has no reference price. */
export function publishedDiscountPercent(type: string): number | null {
  const selling = publishedMajor(type);
  const compare = publishedCompareMajor(type);
  if (selling == null || compare == null || !(compare > selling)) return null;
  return Math.round(((compare - selling) / compare) * 100);
}

/** Feed regular price is the reference price. The sale price is what the customer pays. */
export function catalogFeedAmounts(type: string, stored?: number | null): { currency: string; regularMinor: number; saleMinor: number | null } | null {
  const selling = authoritativeMinor(type, stored);
  if (selling == null) return null;
  const compare = publishedCompareMajor(type);
  const compareMinor = compare == null ? null : Math.round(compare * 100);
  if (compareMinor != null && compareMinor > selling) {
    return { currency: storeCurrency, regularMinor: compareMinor, saleMinor: selling };
  }
  return { currency: storeCurrency, regularMinor: selling, saleMinor: null };
}

export function catalogMajorForSlug(slug: string): number | null {
  return indiaMajorForSlug(slug);
}

export function catalogCompareForSlug(slug: string): number | null {
  return indiaReferenceForSlug(slug);
}

const INR = publishedPrices.inr;

export function indiaMajorForType(type: string): number | null {
  if (type === "DEVICE") return INR.device;
  if (type === "CARTRIDGE_TRIO") return INR.cartridgeTrio;
  if (type === "REFILL") return INR.refill;
  if (type === "BUNDLE") return INR.bundle;
  return null;
}

export function indiaCompareForType(type: string): number | null {
  if (type === "DEVICE") return INR.deviceCompareAt;
  if (type === "CARTRIDGE_TRIO") return INR.cartridgeTrioCompareAt;
  if (type === "REFILL") return INR.refillCompareAt;
  if (type === "BUNDLE") return INR.bundleCompareAt;
  return null;
}

export function indiaMinorForType(type: string): number | null {
  const major = indiaMajorForType(type);
  return major == null ? null : major * 100;
}

export function indiaMajorForSlug(slug: string): number | null {
  if (slug === "rouge-sur-mesure") return INR.device;
  if (slug === "rouge-sur-mesure-bundle") return INR.bundle;
  if (slug === "cartridge-refill") return INR.refill;
  if (slug.startsWith("cartridge-trio-")) return INR.cartridgeTrio;
  return null;
}

function cents(usd: number) {
  return Math.round(usd * 100);
}

/** A catalog dollar amount, selling or reference, as its published whole-rupee price. */
export function indiaListedMajor(usd: number | null | undefined): number | null {
  if (usd == null) return null;
  const key = cents(usd);
  if (key === cents(publishedPrices.device) || key === cents(publishedPrices.bundle)) return INR.device;
  if (key === cents(publishedPrices.cartridgeTrio)) return INR.cartridgeTrio;
  if (key === cents(publishedPrices.refill)) return INR.refill;
  if (key === cents(publishedPrices.deviceCompareAt) || key === cents(publishedPrices.bundleCompareAt)) return INR.deviceCompareAt;
  if (key === cents(publishedPrices.cartridgeTrioCompareAt)) return INR.cartridgeTrioCompareAt;
  return null;
}

/** Reference rupee price for a selling dollar amount when no compare-at was passed. */
export function indiaSubtotalMajor(items: { slug: string; quantity: number }[]): number | null {
  let sum = 0;
  for (const item of items) {
    const major = indiaMajorForSlug(item.slug);
    if (major == null) return null;
    sum += major * item.quantity;
  }
  return sum;
}

export function indiaReferenceForSlug(slug: string): number | null {
  if (slug === "rouge-sur-mesure") return INR.deviceCompareAt;
  if (slug === "rouge-sur-mesure-bundle") return INR.bundleCompareAt;
  if (slug === "cartridge-refill") return INR.refillCompareAt;
  if (slug.startsWith("cartridge-trio-")) return INR.cartridgeTrioCompareAt;
  return null;
}

export function indiaReferenceSubtotalMajor(items: { slug: string; quantity: number }[]): number | null {
  let sum = 0;
  for (const item of items) {
    const major = indiaReferenceForSlug(item.slug);
    if (major == null) return null;
    sum += major * item.quantity;
  }
  return sum;
}

/** Country and a browser currency do not select a price. Every active product uses the stored rupee table. */
export function offerForCurrency(type: string, _currency?: string): { price: number | null; currency: string } {
  return { price: publishedMajor(type), currency: storeCurrency };
}

/** Browser events report the catalog selling price already on the line. The server replaces this value. */
export function metaLineAmount(major: number | null | undefined, _marketCurrency?: string): { value?: number; currency: string } {
  return major == null ? { currency: storeCurrency } : { value: major, currency: storeCurrency };
}

export function metaBasketAmount(lines: { price?: number | null; quantity: number }[], _marketCurrency?: string): { value?: number; currency: string } {
  if (lines.some((line) => line.price == null)) return { currency: storeCurrency };
  return {
    currency: storeCurrency,
    value: lines.reduce((sum, line) => sum + (line.price || 0) * line.quantity, 0),
  };
}

export function indiaCompareForSellUsd(usd: number | null | undefined): number | null {
  if (usd == null) return null;
  const key = cents(usd);
  if (key === cents(publishedPrices.device) || key === cents(publishedPrices.bundle)) return INR.deviceCompareAt;
  if (key === cents(publishedPrices.cartridgeTrio)) return INR.cartridgeTrioCompareAt;
  if (key === cents(publishedPrices.refill)) return INR.refillCompareAt;
  return null;
}
