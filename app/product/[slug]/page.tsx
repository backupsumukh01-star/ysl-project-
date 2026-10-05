import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { formatMoney } from "@/lib/product";
import { getSettings } from "@/lib/settings";
import { CatalogProductView } from "@/components/catalog-product";
import { RefillPurchase } from "@/components/refill-purchase";
import { cartridgeColor, cartridgeCode, cartridgeFamily, cartridgeLabel, cartridgePhotoSrc, cartridgeShade, soldCartridgeOrder } from "@/lib/cartridge-photos";
import { publishedPrices } from "@/lib/pricing";
import { productJsonLd } from "@/lib/seo-product";
import "../../quiet.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cartridge?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.slug === "cartridge-refill") {
    const options = product.variants
      .map((variant) => {
        const code = cartridgeCode(variant.name) || cartridgeCode(variant.sku);
        return {
          id: variant.id,
          code,
          shade: cartridgeShade(code),
          family: cartridgeFamily(code),
          name: cartridgeLabel(code) || variant.name,
          sku: variant.sku,
          price: variant.price ?? product.price,
          image: cartridgePhotoSrc(code),
          color: cartridgeColor(code),
        };
      })
      .filter((variant) => variant.code && variant.image)
      .sort((a, b) => {
        const left = soldCartridgeOrder.indexOf(a.code as (typeof soldCartridgeOrder)[number]);
        const right = soldCartridgeOrder.indexOf(b.code as (typeof soldCartridgeOrder)[number]);
        return (left < 0 ? soldCartridgeOrder.length : left) - (right < 0 ? soldCartridgeOrder.length : right);
      });
    const maxQuantity = product.trackInventory ? Math.max(1, Math.min(10, product.stock - product.reserved)) : 10;
    const photo = options.find((option) => option.code === cartridgeCode(query.cartridge))?.image || options[0]?.image;
    const jsonLd = productJsonLd({
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      currency: publishedPrices.currency,
      image: photo,
      path: `/product/${product.slug}`,
      inStock: product.inStock,
    });
    return (
      <main id="main" className="page trio-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <RefillPurchase
          product={{ id: product.id, slug: product.slug, name: product.name, maxQuantity, inStock: product.inStock }}
          options={options}
          initialCode={cartridgeCode(query.cartridge)}
        />
      </main>
    );
  }
  const settings = await getSettings();
  const shippingPublished = settings.shippingEnabled && settings.shippingFlatMinor != null;
  const shippingNote = shippingPublished
    ? settings.shippingFlatMinor === 0
      ? "Shipping is included in the price."
      : `Shipping is ${formatMoney(settings.shippingFlatMinor! / 100, settings.currency)}.`
    : "A shipping price has not been published yet.";
  const photo = product.images.find((image) => image.src && !image.src.includes("swatches"));
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    currency: publishedPrices.currency,
    image: photo?.src,
    path: `/product/${product.slug}`,
    inStock: product.inStock,
  });
  return (
    <main id="main" className="page quiet-page catalog-offer">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CatalogProductView product={product} shippingNote={shippingNote} />
    </main>
  );
}
