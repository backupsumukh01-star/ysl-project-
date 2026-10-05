import { publishedEmail, siteConfig } from "@/lib/config";
import { db } from "@/lib/db";

export type StoreSettings = {
  currency: string;
  shippingEnabled: boolean;
  shippingFlatMinor: number | null;
  freeShippingThresholdMinor: number | null;
  shippingEstimate: string;
  taxRateBps: number;
  shippingMessage: string;
  returnsMessage: string;
  supportEmail: string;
  sellerName: string;
  announcement: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimary: string;
  heroSecondary: string;
  reviewsPublicWithoutModeration: boolean;
};

const defaults: StoreSettings = {
  currency: siteConfig.currency,
  shippingEnabled: process.env.SHIPPING_ENABLED === "true",
  shippingFlatMinor: envMinor("SHIPPING_FLAT_MINOR") ?? (siteConfig.shippingFlat == null ? null : Math.round(siteConfig.shippingFlat * 100)),
  freeShippingThresholdMinor: envMinor("SHIPPING_FREE_THRESHOLD_MINOR"),
  shippingEstimate: (process.env.SHIPPING_ESTIMATE || "").trim(),
  taxRateBps: envBps("TAX_RATE_BPS"),
  shippingMessage: siteConfig.shippingMessage,
  returnsMessage: siteConfig.returnsMessage,
  supportEmail: siteConfig.supportEmail,
  sellerName: siteConfig.sellerName,
  announcement: "",
  heroKicker: "Custom Lip Color Creator",
  heroTitle: "Your lip color.\nCreated your way.",
  heroSubtitle: "A luxury custom lip color experience designed to help you discover and create a shade that feels uniquely yours.",
  heroPrimary: "Shop now",
  heroSecondary: "See how it works",
  reviewsPublicWithoutModeration: false,
};

function envMinor(name: string): number | null {
  const value = process.env[name];
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

function envBps(name: string): number {
  const value = process.env[name];
  if (value == null || value.trim() === "") return 0;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) return 0;
  return parsed;
}

function numberOrNull(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getSettings(): Promise<StoreSettings> {
  const prisma = db();
  if (!prisma) return defaults;
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = new Map(rows.map((row) => [row.key, row.value]));
    const read = (key: keyof StoreSettings) => map.get(key);
    return {
      currency: read("currency") || defaults.currency,
      shippingEnabled: map.has("shippingEnabled") ? read("shippingEnabled") === "true" : defaults.shippingEnabled,
      shippingFlatMinor: map.has("shippingFlatMinor") ? numberOrNull(read("shippingFlatMinor")) : defaults.shippingFlatMinor,
      freeShippingThresholdMinor: map.has("freeShippingThresholdMinor") ? numberOrNull(read("freeShippingThresholdMinor")) : defaults.freeShippingThresholdMinor,
      shippingEstimate: map.has("shippingEstimate") ? read("shippingEstimate") || "" : defaults.shippingEstimate,
      taxRateBps: map.has("taxRateBps") && (read("taxRateBps") || "").trim() !== "" ? Number(read("taxRateBps")) || 0 : defaults.taxRateBps,
      shippingMessage: read("shippingMessage") || defaults.shippingMessage,
      returnsMessage: read("returnsMessage") || defaults.returnsMessage,
      supportEmail: publishedEmail(read("supportEmail") || defaults.supportEmail),
      sellerName: read("sellerName") || defaults.sellerName,
      announcement: read("announcement") || "",
      heroKicker: read("heroKicker") || defaults.heroKicker,
      heroTitle: read("heroTitle") || defaults.heroTitle,
      heroSubtitle: read("heroSubtitle") || defaults.heroSubtitle,
      heroPrimary: read("heroPrimary") || defaults.heroPrimary,
      heroSecondary: read("heroSecondary") || defaults.heroSecondary,
      reviewsPublicWithoutModeration: read("reviewsPublicWithoutModeration") === "true",
    };
  } catch {
    return defaults;
  }
}

export async function saveSettings(input: Record<string, string>) {
  const prisma = db();
  if (!prisma) throw new Error("DATABASE_URL is not configured");
  await prisma.$transaction(
    Object.entries(input).map(([key, value]) =>
      prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } }),
    ),
  );
}
