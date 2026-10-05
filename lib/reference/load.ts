import { listProducts } from "@/lib/catalog";
import { publishedMajor } from "@/lib/pricing";
import { referenceImages } from "@/lib/reference/images";
import type { RefOffer } from "@/lib/reference/types";

function imagesFor(type: string, fallback: { src: string; alt: string }[]) {
  if (type === "DEVICE") return referenceImages.device.map((image) => ({ src: image.src, alt: image.alt }));
  if (type === "CARTRIDGE_TRIO") return [referenceImages.cartridgeTrio, referenceImages.colorVisual];
  if (type === "REFILL") return [referenceImages.refill];
  if (type === "BUNDLE") return [{ src: referenceImages.bundle.src, alt: referenceImages.bundle.alt }];
  return fallback;
}

export async function loadReferenceOffers(): Promise<RefOffer[]> {
  const products = (await listProducts()).filter((product) => product.type !== "ACCESSORY");
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price ?? publishedMajor(product.type),
    sku: product.sku,
    type: product.type,
    inStock: product.inStock,
    availability: product.availability,
    included: product.included,
    images: imagesFor(product.type, product.images.map((image) => ({ src: image.src, alt: image.alt }))),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      price: variant.price ?? product.price ?? publishedMajor(product.type),
    })),
  }));
}

export function pick(offers: RefOffer[], slug: string) {
  return offers.find((item) => item.slug === slug) || null;
}
