import prices from "@/lib/catalog-prices.json";

export const publishedPrices = prices;

export function publishedMajor(type: string): number | null {
  if (type === "DEVICE") return publishedPrices.device;
  if (type === "CARTRIDGE_TRIO") return publishedPrices.cartridgeTrio;
  if (type === "REFILL") return publishedPrices.refill;
  if (type === "BUNDLE") return publishedPrices.bundle;
  return null;
}

export function publishedCompareMajor(type: string): number | null {
  if (type === "DEVICE") return publishedPrices.deviceCompareAt;
  if (type === "CARTRIDGE_TRIO") return publishedPrices.cartridgeTrioCompareAt;
  if (type === "BUNDLE") return publishedPrices.bundleCompareAt;
  return null;
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

export function catalogMajorForSlug(slug: string): number | null {
  if (slug === "rouge-sur-mesure") return publishedPrices.device;
  if (slug === "rouge-sur-mesure-bundle") return publishedPrices.bundle;
  if (slug === "cartridge-refill") return publishedPrices.refill;
  if (slug.startsWith("cartridge-trio-")) return publishedPrices.cartridgeTrio;
  return null;
}

export function catalogCompareForSlug(slug: string): number | null {
  if (slug === "rouge-sur-mesure") return publishedPrices.deviceCompareAt;
  if (slug === "rouge-sur-mesure-bundle") return publishedPrices.bundleCompareAt;
  if (slug.startsWith("cartridge-trio-")) return publishedPrices.cartridgeTrioCompareAt;
  return null;
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

export function offerForCurrency(type: string, currency: string): { price: number | null; currency: string } {
  if (currency === "INR") return { price: indiaMajorForType(type), currency: "INR" };
  return { price: publishedMajor(type), currency: publishedPrices.currency };
}

export function indiaCompareForSellUsd(usd: number | null | undefined): number | null {
  if (usd == null) return null;
  const key = cents(usd);
  if (key === cents(publishedPrices.device) || key === cents(publishedPrices.bundle)) return INR.deviceCompareAt;
  if (key === cents(publishedPrices.cartridgeTrio)) return INR.cartridgeTrioCompareAt;
  if (key === cents(publishedPrices.refill)) return INR.refillCompareAt;
  return null;
}
