import { db } from "@/lib/db";
import { canRecordAnalytics, canSendMarketingEvent, type ConsentChoice } from "@/lib/analytics/consent";
import { sendMetaServerEvent } from "@/lib/analytics/meta-server";

const SERVER_OWNED = new Set(["Purchase", "AddPaymentInfo", "CompleteRegistration", "Contact"]);

const SERVER_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "RemoveFromCart",
  "InitiateCheckout",
  "Lead",
  "HowItWorksViewed",
  "DemoVideoPlayed",
  "ColorExperienceViewed",
]);

type Incoming = {
  event?: string;
  url?: string;
  payload?: {
    eventId?: string;
    contentIds?: string[];
    contentName?: string;
    contentType?: string;
    contents?: { id: string; quantity: number; item_price?: number }[];
    value?: number;
    currency?: string;
    quantity?: number;
    numItems?: number;
    searchString?: string;
    orderId?: string;
  };
};

function deviceType(userAgent: string) {
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";
  if (/Mobile|Android|iPhone/i.test(userAgent)) return "mobile";
  return "desktop";
}

async function canonicalContentIds(ids: string[]) {
  const limited = ids.slice(0, 20).map((id) => id.slice(0, 80));
  const prisma = db();
  if (!prisma || !limited.length) return limited;
  const rows = await prisma.product.findMany({
    where: { OR: [{ id: { in: limited } }, { slug: { in: limited } }] },
    select: { id: true, slug: true },
  });
  return limited.map((id) => rows.find((row) => row.id === id || row.slug === id)?.id || id);
}

export async function acceptBrowserEvent(request: Request, body: Incoming, consent: ConsentChoice) {
  const name = String(body.event || "");
  const payload = body.payload || {};
  const eventId = String(payload.eventId || "").slice(0, 120);
  if (!name || !eventId) return;
  const contentIds = await canonicalContentIds(payload.contentIds || []);
  const userAgent = request.headers.get("user-agent") || "";
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";
  const cookie = request.headers.get("cookie") || "";
  const fbp = cookie.match(/(?:^|;\s*)_fbp=([^;]+)/)?.[1] || "";
  const fbc = cookie.match(/(?:^|;\s*)rsm_fbc=([^;]+)/)?.[1] || "";
  const sessionId = cookie.match(/(?:^|;\s*)rsm_sid=([^;]+)/)?.[1] || "";
  const url = String(body.url || "").slice(0, 300);
  let source = "";
  let medium = "";
  let campaign = "";
  try {
    const parsed = new URL(url);
    source = parsed.searchParams.get("utm_source") || "";
    medium = parsed.searchParams.get("utm_medium") || "";
    campaign = parsed.searchParams.get("utm_campaign") || "";
  } catch {
    /* A relative or empty URL is not an error. */
  }
  if (canRecordAnalytics(consent) && !SERVER_OWNED.has(name)) {
    const prisma = db();
    if (prisma) {
      const existing = await prisma.analyticsEvent.findFirst({ where: { eventId } });
      if (!existing) {
        await prisma.analyticsEvent.create({
        data: {
          name,
          eventId,
          sessionId: decodeURIComponent(sessionId).slice(0, 80),
          path: url.split("?")[0]?.slice(0, 200) || "",
          contentIds: contentIds.join(",").slice(0, 400),
          valueMinor: typeof payload.value === "number" ? Math.round(payload.value * 100) : null,
          currency: String(payload.currency || "").slice(0, 8),
          source: source.slice(0, 120),
          medium: medium.slice(0, 120),
          campaign: campaign.slice(0, 120),
          device: deviceType(userAgent),
        },
        });
      }
    }
  }
  if (!SERVER_EVENTS.has(name) || !canSendMarketingEvent(consent)) return;
  const customData: Record<string, unknown> = {};
  if (contentIds.length) customData.content_ids = contentIds;
  if (payload.contentType) customData.content_type = payload.contentType;
  if (payload.contentName) customData.content_name = String(payload.contentName).slice(0, 160);
  if (payload.contents?.length) {
    customData.contents = payload.contents.slice(0, 20).map((item) => ({
      ...item,
      id: contentIds[payload.contentIds?.indexOf(item.id) ?? -1] || item.id,
    }));
  }
  if (typeof payload.value === "number") customData.value = payload.value;
  if (payload.currency) customData.currency = payload.currency;
  if (typeof payload.quantity === "number") customData.quantity = payload.quantity;
  if (typeof payload.numItems === "number") customData.num_items = payload.numItems;
  if (payload.searchString) customData.search_string = String(payload.searchString).slice(0, 100);
  await sendMetaServerEvent({
    eventName: name,
    eventId,
    customData,
    sourceUrl: url,
    consent,
    userData: {
      ip,
      userAgent,
      fbp: decodeURIComponent(fbp),
      fbc: decodeURIComponent(fbc),
    },
  });
}
