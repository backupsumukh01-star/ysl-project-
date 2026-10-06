import prices from "@/lib/catalog-prices.json";

function optionalNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function optionalText(value: string | undefined, fallback = ""): string {
  const text = value?.trim();
  return text ? text : fallback;
}

const previousReturnsMessage = "You can return or replace a product within 10 days of delivery.";

/** Shown in the footer, on invoices, and wherever the short store setting is used. */
export const returnsSummary =
  "An order cannot be cancelled after it is placed. Replacement and refund rules are on the Terms page.";

/** The replacement and refund rule. The old 10-day return line is no longer used. */
export const returnsPolicy =
  "An order cannot be cancelled after it is placed. A faulty product can be replaced. If a second replacement is also not right, you can ask for a refund. If an order has not shipped within 20 days of the order date, you can ask for a refund. An approved refund takes 7 to 15 days.";

export function publishedReturns(value: string | undefined | null): string {
  const text = value?.trim() || "";
  if (!text || text === previousReturnsMessage || text === returnsPolicy) return returnsSummary;
  return text;
}

/** A real mailbox. Example domains are treated as unpublished. */
export function publishedEmail(value: string | undefined | null): string {
  const text = value?.trim() || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "";
  const host = text.split("@")[1]?.toLowerCase() || "";
  if (host === "example.com" || host === "example.org" || host === "example.net") return "";
  return text;
}

export const siteConfig = {
  siteName: "Rouge Sur Mesure",
  sellerName: optionalText(process.env.SELLER_NAME, "Rouge Beauty"),
  siteUrl: optionalText(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  supportEmail: publishedEmail(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
  supportPhone: optionalText(process.env.NEXT_PUBLIC_SUPPORT_PHONE),
  supportHours: optionalText(process.env.NEXT_PUBLIC_SUPPORT_HOURS),
  currency: optionalText(process.env.NEXT_PUBLIC_CURRENCY, prices.currency),
  defaultCountry: optionalText(process.env.NEXT_PUBLIC_DEFAULT_COUNTRY, "United States"),
  shippingMessage: optionalText(
    process.env.NEXT_PUBLIC_SHIPPING_MESSAGE,
    "Shipping is included in the product price. There is no separate shipping charge.",
  ),
  returnsMessage: publishedReturns(process.env.NEXT_PUBLIC_RETURNS_MESSAGE),
  productPrice: optionalNumber(process.env.NEXT_PUBLIC_PRODUCT_PRICE),
  productComparePrice: optionalNumber(process.env.NEXT_PUBLIC_PRODUCT_COMPARE_PRICE),
  shippingFlat: optionalNumber(process.env.NEXT_PUBLIC_SHIPPING_FLAT),
  social: {
    instagram: optionalText(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
    facebook: optionalText(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
    pinterest: optionalText(process.env.NEXT_PUBLIC_SOCIAL_PINTEREST),
    tiktok: optionalText(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK),
  },
  analytics: {
    gaId: optionalText(process.env.NEXT_PUBLIC_GA_ID),
    metaPixelId: optionalText(process.env.NEXT_PUBLIC_META_PIXEL_ID),
  },
  whatsapp: optionalText(process.env.WHATSAPP_SUPPORT_NUMBER),
  referenceContacts: {
    findStoreLabel: "Find a store",
    findStoreHref: optionalText(process.env.NEXT_PUBLIC_FIND_STORE_URL),
    contactLabel: "Contact us",
    contactHref: "/contact",
    chatLabel: "Chat with us",
    chatHref: optionalText(process.env.NEXT_PUBLIC_CHAT_URL),
    phoneLabel: optionalText(process.env.NEXT_PUBLIC_SUPPORT_PHONE, "Phone not configured"),
  },
  features: {
    wishlist: process.env.FEATURE_WISHLIST !== "false",
    backInStock: process.env.FEATURE_BACK_IN_STOCK !== "false",
    abandonedCart: process.env.FEATURE_ABANDONED_CART !== "false",
    giftCard: process.env.FEATURE_GIFT_CARD === "true",
    referral: process.env.FEATURE_REFERRAL === "true",
    pwa: process.env.FEATURE_PWA === "true",
  },
};

export type SocialName = keyof typeof siteConfig.social;

export const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/faq", label: "FAQ" },
] as const;

export const menuLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/app", label: "App" },
  { href: "/manual", label: "How to use" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Support" },
  { href: "/account", label: "Account" },
] as const;
