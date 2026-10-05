import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/config";
import { authoritativeMinor } from "@/lib/pricing";

export const dynamic = "force-dynamic";

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const prisma = db();
  const settings = await getSettings();
  if (!prisma) return new Response("Feed is not available.", { status: 503 });
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: { where: { active: true }, orderBy: { sortOrder: "asc" } }, category: true },
  });
  const items = products
    .map((product) => {
      const priceMinor = authoritativeMinor(product.type, product.priceMinor);
      if (priceMinor == null) return "";
      const image = product.images[0];
      const availability = product.trackInventory && product.stock - product.reserved <= 0 ? "out of stock" : "in stock";
      return `<item>
        <g:id>${xml(product.id)}</g:id>
        <g:title>${xml(product.name)}</g:title>
        <g:description>${xml(product.description || product.shortDescription)}</g:description>
        <g:link>${xml(`${siteConfig.siteUrl}/product/${product.slug}`)}</g:link>
        <g:image_link>${xml(image ? new URL(image.src, siteConfig.siteUrl).toString() : "")}</g:image_link>
        <g:availability>${availability}</g:availability>
        <g:price>${(priceMinor / 100).toFixed(2)} ${xml(settings.currency)}</g:price>
        <g:brand>Rouge Sur Mesure</g:brand>
        <g:condition>new</g:condition>
        <g:identifier_exists>no</g:identifier_exists>
        <g:mpn>${xml(product.sku || product.id)}</g:mpn>
        <g:product_type>${xml(product.category?.name || product.type)}</g:product_type>
      </item>`;
    })
    .join("");
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>
<title>Rouge Sur Mesure</title>
<link>${xml(siteConfig.siteUrl)}</link>
<description>Product data prepared for a future shopping catalog. Merchant Center is not connected until that setup is completed.</description>
${items}
</channel></rss>`;
  return new Response(feed, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
