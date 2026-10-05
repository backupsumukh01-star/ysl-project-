import prices from "@/lib/catalog-prices.json";

export const publishedPrices = prices;

export function publishedMajor(type: string): number | null {
  if (type === "DEVICE") return publishedPrices.device;
  if (type === "CARTRIDGE_TRIO") return publishedPrices.cartridgeTrio;
  if (type === "REFILL") return publishedPrices.refill;
  if (type === "BUNDLE") return publishedPrices.bundle;
  return null;
}

export function publishedMinor(type: string): number | null {
  const major = publishedMajor(type);
  return major == null ? null : Math.round(major * 100);
}

/** Original price that displays as `percentOff` against the selling price. Selling price is unchanged. */
export function markedOriginal(price: number | null | undefined, percentOff = 71): number | null {
  if (price == null || !(price > 0) || percentOff <= 0 || percentOff >= 100) return null;
  const priceMinor = Math.round(price * 100);
  const keep = 100 - percentOff;
  let compare = Math.round((priceMinor * 100) / keep);
  if (compare <= priceMinor) compare = priceMinor + 1;
  for (let step = 0; step < 6; step += 1) {
    const shown = Math.round(((compare - priceMinor) / compare) * 100);
    if (shown === percentOff) return compare / 100;
    compare += shown < percentOff ? 1 : -1;
    if (compare <= priceMinor) compare = priceMinor + 1;
  }
  return compare / 100;
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
