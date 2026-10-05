import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { listProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  const paths = ["", "/shop", "/experience", "/about", "/faq", "/app", "/manual", "/contact", "/shipping", "/returns", "/privacy", "/terms", "/risk-disclosure", "/help", "/track-order", "/cart"];
  return [
    ...paths.map((path) => ({ url: `${siteConfig.siteUrl}${path || "/"}`, lastModified: new Date() })),
    ...products.map((product) => ({ url: `${siteConfig.siteUrl}/product/${product.slug}`, lastModified: new Date() })),
  ];
}
