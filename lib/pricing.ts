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
