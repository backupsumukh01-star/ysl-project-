import { db } from "@/lib/db";
import { authoritativeMinor, publishedPrices } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

export const storeCurrency = publishedPrices.currency;

const PRICED = new Set(["ViewContent", "AddToCart", "InitiateCheckout"]);

type ItemRef = { id: string; quantity: number };

type ResolvedLine = {
  id: string;
  name: string;
  unitMinor: number;
  quantity: number;
};

export type AuthoritativeMeta = {
  contentIds: string[];
  valueMinor: number | null;
  currency: string;
  customData: Record<string, unknown>;
};

function clampQty(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.floor(value)));
}

function itemRefs(payload: {
  contentIds?: string[];
  contents?: { id: string; quantity: number }[];
  quantity?: number;
}) {
  if (payload.contents?.length) {
    return payload.contents.slice(0, 20).map((item) => ({
      id: String(item.id || "").slice(0, 80),
      quantity: clampQty(Number(item.quantity)),
    }));
  }
  const quantity = clampQty(Number(payload.quantity) || 1);
  return (payload.contentIds || []).slice(0, 20).map((id) => ({ id: String(id).slice(0, 80), quantity }));
}

async function resolveLines(refs: ItemRef[]): Promise<ResolvedLine[]> {
  const prisma = db();
  const ids = refs.map((ref) => ref.id).filter(Boolean);
  if (!prisma || !ids.length) return [];
  const products = await prisma.product.findMany({
    where: { active: true, OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
    select: { id: true, slug: true, name: true, type: true, priceMinor: true },
  });
  const lines: ResolvedLine[] = [];
  for (const ref of refs) {
    const product = products.find((row) => row.id === ref.id || row.slug === ref.id);
    if (!product) continue;
    const unitMinor = authoritativeMinor(product.type, product.priceMinor);
    if (unitMinor == null) continue;
    lines.push({ id: product.id, name: product.name, unitMinor, quantity: ref.quantity });
  }
  return lines;
}

export async function authoritativeMetaEvent(
  eventName: string,
  payload: {
    contentIds?: string[];
    contents?: { id: string; quantity: number }[];
    quantity?: number;
  },
): Promise<AuthoritativeMeta | null> {
  if (!PRICED.has(eventName)) return null;
  const lines = await resolveLines(itemRefs(payload));
  const currency = storeCurrency;
  if (!lines.length) {
    return { contentIds: [], valueMinor: null, currency, customData: { currency } };
  }
  if (eventName === "ViewContent" || eventName === "AddToCart") {
    const line = lines[0];
    const quantity = eventName === "ViewContent" ? 1 : line.quantity;
    const valueMinor = line.unitMinor * quantity;
    return {
      contentIds: [line.id],
      valueMinor,
      currency,
      customData: {
        currency,
        value: valueMinor / 100,
        content_ids: [line.id],
        content_type: "product",
        content_name: line.name.slice(0, 160),
        contents: [{ id: line.id, quantity, item_price: line.unitMinor / 100 }],
        quantity,
      },
    };
  }
  const settings = await getSettings();
  const subtotalMinor = lines.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0);
  const shippingKnown = settings.shippingEnabled && settings.shippingFlatMinor != null;
  const threshold = settings.freeShippingThresholdMinor;
  const shippingMinor = !shippingKnown
    ? 0
    : threshold != null && subtotalMinor >= threshold
      ? 0
      : settings.shippingFlatMinor || 0;
  const taxMinor = settings.taxRateBps > 0 ? Math.round((subtotalMinor * settings.taxRateBps) / 10000) : 0;
  const valueMinor = subtotalMinor + (shippingKnown ? shippingMinor : 0) + taxMinor;
  return {
    contentIds: lines.map((line) => line.id),
    valueMinor,
    currency,
    customData: {
      currency,
      value: valueMinor / 100,
      content_ids: lines.map((line) => line.id),
      content_type: "product",
      contents: lines.map((line) => ({ id: line.id, quantity: line.quantity, item_price: line.unitMinor / 100 })),
      num_items: lines.reduce((sum, line) => sum + line.quantity, 0),
    },
  };
}
