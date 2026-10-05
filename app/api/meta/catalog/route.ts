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
  if (!prisma) return new Response("Catalog is not available.", { status: 503 });
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: { where: { active: true }, orderBy: { sortOrder: "asc" } }, category: true, variants: { where: { active: true } } },
  });
  const items = products
    .map((product) => {
      const priceMinor = authoritativeMinor(product.type, product.priceMinor);
      if (priceMinor == null) return "";
      const image = product.images[0];
      const extras = product.images.slice(1, 6);
      const availability = product.trackInventory && product.stock <= 0 ? "out of stock" : "in stock";
      const link = `${siteConfig.siteUrl}/product/${product.slug}`;
      const imageLink = image ? new URL(image.src, siteConfig.siteUrl).toString() : "";
      return `<item>
        <g:id>${xml(product.id)}</g:id>
        <g:title>${xml(product.name)}</g:title>
        <g:description>${xml(product.description || product.shortDescription)}</g:description>
        <g:availability>${availability}</g:availability>
        <g:condition>new</g:condition>
        <g:price>${(priceMinor / 100).toFixed(2)} ${xml(settings.currency)}</g:price>
        <g:link>${xml(link)}</g:link>
        <g:image_link>${xml(imageLink)}</g:image_link>
        ${extras.map((extra) => `<g:additional_image_link>${xml(new URL(extra.src, siteConfig.siteUrl).toString())}</g:additional_image_link>`).join("")}
        <g:brand>Rouge Sur Mesure</g:brand>
        <g:product_type>${xml(product.category?.name || product.type)}</g:product_type>
        <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics</g:google_product_category>
        <g:mpn>${xml(product.sku || product.id)}</g:mpn>
        ${product.variants[0] ? `<g:item_group_id>${xml(product.id)}</g:item_group_id>` : ""}
      </item>`;
    })
    .join("");
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Rouge Sur Mesure</title>
    <link>${xml(siteConfig.siteUrl)}</link>
    <description>Product data for a future Meta catalog. This feed is not connected to a Meta Business account until that setup is completed.</description>
    ${items}
  </channel>
</rss>`;
  return new Response(feed, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
