import { siteConfig } from "@/lib/config";
import { publishedPrices } from "@/lib/pricing";
import { appRequirement, cartridges, ingredients, trios } from "../prisma/catalog-facts.mjs";

export type GalleryImage = {
  src: string;
  alt: string;
  position: string;
};

export const product = {
  id: "rouge-sur-mesure",
  slug: "rouge-sur-mesure",
  name: "Rouge Sur Mesure",
  eyebrow: "Custom Lip Color Creator",
  shortDescription: "Design your lip shades, then take them with you.",
  description:
    "Rouge Sur Mesure is a custom lip color creator. The device, a supported cartridge trio, and the official companion app are used together. This purchase includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional cartridge trios and refills are available separately.",
  price: publishedPrices.device,
  compareAtPrice: siteConfig.productComparePrice,
  currency: publishedPrices.currency,
  availability: "Availability is confirmed with your order.",
  shippingMessage: siteConfig.shippingMessage,
  features: [
    "Matte-black cylindrical form",
    "Quilted lid with a gold monogram and gold rim",
    "Droplet button on the front",
    "Presented in a black box with the lid",
  ],
  images: {
    hero: {
      src: "/images/hero.png",
      alt: "Matte-black Rouge Sur Mesure device with a quilted gold-rimmed lid, standing on dark marble.",
      position: "center 20%",
    },
    showcase: {
      src: "/images/showcase.png",
      alt: "Three-quarter view of the closed Rouge Sur Mesure device on black marble.",
      position: "center center",
    },
    macro: {
      src: "/images/macro.png",
      alt: "Close view of the quilted black lid, gold rim, and gold monogram.",
      position: "center center",
    },
    finished: {
      src: "/images/finished-shade.png",
      alt: "The closed device beside a single finished lip-color smear on a dark dish.",
      position: "center center",
    },
    swatches: {
      src: "/images/swatches.png",
      alt: "Five lip-color swatches, from nude to deep berry, on warm ivory.",
      position: "center center",
    },
    woman: {
      src: "/images/woman-device.png",
      alt: "A woman holding the closed Rouge Sur Mesure device.",
      position: "center 20%",
    },
    lip: {
      src: "/images/lip-result.png",
      alt: "A close portrait of lipstick applied to the outer lip.",
      position: "center 30%",
    },
    vanity: {
      src: "/images/vanity.png",
      alt: "The closed device on a black vanity with warm mirror lights.",
      position: "center center",
    },
    lifestyle: {
      src: "/images/lifestyle.png",
      alt: "Editorial portrait with the closed device on the table in front of a woman.",
      position: "center center",
    },
    hand: {
      src: "/images/hand.png",
      alt: "A hand with black nail polish holding the closed device.",
      position: "center center",
    },
    app: {
      src: "/images/app.png",
      alt: "The closed device beside a phone showing three overlapping circles of color.",
      position: "center center",
    },
    packaging: {
      src: "/images/packaging.png",
      alt: "Open black box with the quilted lid in the upper tray and the device below.",
      position: "center center",
    },
    unboxing: {
      src: "/images/unboxing.png",
      alt: "Hands opening the black presentation box to reveal the lid and the device.",
      position: "center center",
    },
    campaign: {
      src: "/images/campaign.png",
      alt: "The closed device centered in a black and champagne-gold setting.",
      position: "center center",
    },
    marble: {
      src: "/images/marble.png",
      alt: "The closed device on white marble in warm light.",
      position: "center center",
    },
    final: {
      src: "/images/final-hero.png",
      alt: "The closed device in a dark frame with open space above the lid.",
      position: "center bottom",
    },
  } satisfies Record<string, GalleryImage>,
};

export const deviceOffering = {
  items: [
    "Rouge Sur Mesure device",
    "3 complimentary cartridge sets",
    "9 cartridges total",
    "Retractable lip brush",
  ],
  summary: "Includes 3 complimentary cartridge sets — 9 cartridges total",
  includedFamilies: null as string[] | null,
  separateNote: "Additional cartridge trios and refills are available separately.",
  includedText:
    "This purchase includes the Rouge Sur Mesure device, 3 complimentary cartridge trios — 9 cartridges total — and a retractable lip brush. You choose those 3 trios before the device is added to your bag. This does not include every cartridge family.",
};

export const purchaseNotes = {
  availability: product.availability,
  shipping: product.shippingMessage,
  returns: siteConfig.returnsMessage,
  paymentPending: "Payment methods are confirmed at checkout.",
};

export const cartridgeIngredients = ingredients;

const ingredientFamilyOrder = [
  { name: "Nude", codes: ["N1", "N2", "N3"] },
  { name: "Orange", codes: ["O1", "O2", "O3"] },
  { name: "Pink", codes: ["P1", "P2", "P3"] },
  { name: "Red", codes: ["R1", "R2", "R3"] },
] as const;

export const ingredientGroups = ingredientFamilyOrder.map((group) => ({
  name: group.name,
  codes: group.codes.map((code) => {
    const named = cartridges.find((cartridge) => cartridge.code === code)?.name;
    return { code, label: named ? `${code} · ${named}` : code };
  }),
}));

export const supportedTrios = trios.map((trio) => ({
  name: trio.name,
  codes: trio.codes.split(",").join(", "),
}));

export const deviceFacts = {
  type: "Lip Color Creator",
  description: product.description,
  whatItIs:
    "Rouge Sur Mesure is a personal lip color creator. This purchase includes the device, 3 complimentary cartridge trios — 9 cartridges total — and a retractable lip brush. You choose those 3 trios before the device is added to your bag. Additional cartridge trios and refills are sold separately.",
  whatItDoes: `The device produces a color only from one supported trio. Cartridges are not mixed across different trios. The companion app is used on a supported phone: ${appRequirement.ios} ${appRequirement.android} ${appRequirement.bluetooth} Official pages name four ways to choose a color: shade palette, shade match, shade stylist, and Get The Look. This website does not run those tools.`,
};

export const shadeNotes = [
  { name: "Nude", codes: "N1 N2 N3", note: "A wide range of nude tones.", href: "/product/cartridge-trio-nude" },
  { name: "Red", codes: "R1 R2 R3", note: "Scarlet, cherry, and deep burgundy tones.", href: "/product/cartridge-trio-red" },
  { name: "Orange", codes: "O1 O2 O3", note: "Pale coral, bright tangerine, and browner orange.", href: "/product/cartridge-trio-orange" },
  { name: "Pink", codes: "P1 P2 P3", note: "Rosy pinks and vivid plums.", href: "/product/cartridge-trio-pink" },
  { name: "Warm Red", codes: "O1 R1 R2", note: "Brick reds and orange-leaning reds.", href: "/product/cartridge-trio-warm-red" },
  { name: "Warm Nude", codes: "N1 O1 N3", note: "Warmer beiges, pale corals, peach, and caramel.", href: "/product/cartridge-trio-warm-nude" },
  { name: "Cool Nude", codes: "N1 P1 N3", note: "Pink-leaning beiges and rosewood tones.", href: "/product/cartridge-trio-cool-nude" },
];

export function lineKind(sku: string): string {
  if (sku.startsWith("RSM-DEVICE")) return "Device";
  if (sku.startsWith("RSM-TRIO")) return "Cartridge trio";
  if (sku.startsWith("RSM-REFILL") || sku === "O2" || sku === "O3" || sku === "R3" || sku === "N2" || sku === "N3") return "Refill";
  if (sku.startsWith("RSM-BUNDLE")) return "Bundle";
  return "";
}

export function shippingChargeLabel(amount: number | null | undefined, currency = publishedPrices.currency): string {
  if (amount == null) return "Not published";
  if (amount === 0) return "Included";
  return formatMoney(amount, currency);
}

export function formatMoney(amount: number | null, currency = publishedPrices.currency): string {
  if (amount == null) return "Price to be confirmed";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(amount);
}

export function lineTotal(quantity: number): number | null {
  if (product.price == null) return null;
  return product.price * quantity;
}
