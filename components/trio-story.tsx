import { notFound } from "next/navigation";
import { TrioPurchase, type TrioOffer } from "@/components/trio-purchase";
import { getProductBySlug, listProductsByType, type CatalogProduct } from "@/lib/catalog";
import { publishedPrices } from "@/lib/pricing";
import { productJsonLd } from "@/lib/seo-product";
import { trioImageFiles, type TrioFamilyName } from "@/lib/trio-images";
import { availableTrioImages } from "@/lib/trio-images.server";

const familyOrder = Object.keys(trioImageFiles) as TrioFamilyName[];

function toOffer(product: CatalogProduct, photos: Partial<Record<TrioFamilyName, string>>): TrioOffer {
  const family = product.name.replace(/^Cartridge Trio — /, "") as TrioFamilyName;
  const photo = photos[family] ?? "";
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    codes: product.included.split(",").map((code) => code.trim()).filter(Boolean),
    compatibility: product.compatibility,
    inStock: product.inStock,
    maxQuantity: product.trackInventory ? Math.max(1, Math.min(10, product.stock - product.reserved)) : 10,
    image: photo,
    imageAlt: photo ? `${family} cartridge trio` : "",
    seoTitle: product.seoTitle || product.name,
  };
}

export async function TrioStory({ slug }: { slug: string }) {
  const photos = availableTrioImages();
  const listed = await listProductsByType("CARTRIDGE_TRIO");
  const current = listed.find((item) => item.slug === slug) ?? (await getProductBySlug(slug));
  if (!current) notFound();
  const source = listed.some((item) => item.slug === current.slug) ? listed : [current, ...listed];
  const offers = familyOrder
    .map((family) => source.find((item) => item.name.replace(/^Cartridge Trio — /, "") === family))
    .filter((item): item is CatalogProduct => Boolean(item))
    .map((item) => toOffer(item, photos));
  const product = offers.find((item) => item.slug === current.slug) ?? toOffer(current, photos);
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    currency: publishedPrices.currency,
    image: product.image || undefined,
    path: `/product/${slug}`,
    inStock: product.inStock,
  });

  return (
    <main id="main" className="page trio-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrioPurchase product={product} offers={offers.length ? offers : [product]} related={[]} />
    </main>
  );
}
