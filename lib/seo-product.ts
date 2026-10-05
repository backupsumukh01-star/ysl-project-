import { siteConfig } from "@/lib/config";

export function productJsonLd(input: {
  name: string;
  description: string;
  sku?: string;
  price: number | null;
  currency: string;
  image?: string;
  path: string;
  inStock: boolean;
}) {
  const image = input.image && !input.image.includes("swatches") ? [`${siteConfig.siteUrl}${input.image}`] : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.sku || undefined,
    image,
    brand: { "@type": "Brand", name: siteConfig.siteName },
    offers:
      input.price == null
        ? undefined
        : {
            "@type": "Offer",
            priceCurrency: input.currency,
            price: Number.isInteger(input.price) ? String(input.price) : input.price.toFixed(2),
            availability: input.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${siteConfig.siteUrl}${input.path}`,
          },
  };
}
