import { product } from "@/lib/product";

/**
 * Approved photos stay on their current paths.
 * Slots marked placeholder are local stand-ins until a licensed image is added.
 * Swap the path here; components should not hard-code image files.
 */
export const referenceImages = {
  device: [
    product.images.hero,
    product.images.showcase,
    product.images.macro,
    product.images.hand,
    product.images.marble,
    product.images.packaging,
    product.images.app,
  ],
  cartridgeTrio: {
    src: "/images/reference/cartridges/trio-placeholder.svg",
    alt: "Placeholder drawing of three cartridge shapes. Not an official product photograph.",
    placeholder: true,
  },
  refill: {
    src: "/images/swatches.png",
    alt: "Approved color reference used for refill cards.",
    placeholder: false,
  },
  bundle: product.images.packaging,
  app: product.images.app,
  lifestyle: product.images.hand,
  colorVisual: {
    src: "/images/swatches.png",
    alt: "Approved swatch photograph used beside the color-family selector.",
    placeholder: false,
  },
} as const;
