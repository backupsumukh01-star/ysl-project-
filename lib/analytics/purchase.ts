import { contactEventId, paymentInfoEventId, purchaseEventId, registrationEventId } from "@/lib/analytics/ids";
import { canRecordAnalytics, canSendMarketingEvent, consentFromRequest, type ConsentChoice } from "@/lib/analytics/consent";
import { sendMetaServerEvent } from "@/lib/analytics/meta-server";
import { db } from "@/lib/db";
import { logError } from "@/lib/logger";

type Item = { productId: string; quantity: number; unitMinor: number; name: string };
type OrderLike = {
  id: string;
  number: string;
  currency: string;
  totalMinor: number;
  email: string;
  name: string;
  phone: string;
  addressJson: string;
  userId: string | null;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  attributionJson: string;
  items: Item[];
};

export function purchasePayload(order: OrderLike) {
  return {
    eventId: purchaseEventId(order.id),
    currency: order.currency,
    value: order.totalMinor / 100,
    contentIds: order.items.map((item) => item.productId),
    contents: order.items.map((item) => ({ id: item.productId, quantity: item.quantity, item_price: item.unitMinor / 100 })),
    contentType: "product" as const,
    numItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    orderId: order.number,
  };
}

function consentOf(order: OrderLike): ConsentChoice {
  return { necessary: true, analytics: order.analyticsConsent, advertising: order.marketingConsent };
}

export async function sendVerifiedPurchase(order: OrderLike, request?: Request) {
  const payload = purchasePayload(order);
  const consent = consentOf(order);
  try {
    const context = orderContext(order);
    const source = context.source;
    const medium = context.medium;
    const campaign = context.campaign;
    if (canRecordAnalytics(consent)) {
      const prisma = db();
      if (prisma) {
        await prisma.analyticsEvent.create({
          data: {
            name: "Purchase",
            eventId: payload.eventId,
            userId: order.userId || "",
            contentIds: payload.contentIds.join(",").slice(0, 400),
            valueMinor: order.totalMinor,
            currency: order.currency,
            source,
            medium,
            campaign,
          },
        });
      }
    }
    if (!canSendMarketingEvent(consent)) {
      await sendMetaServerEvent({ eventName: "Purchase", eventId: payload.eventId, orderId: order.id, userId: order.userId, consent, customData: { currency: payload.currency, value: payload.value } });
      return;
    }
    const userAgent = request?.headers.get("user-agent") || "";
    const ip = (request?.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";
    await sendMetaServerEvent({
      eventName: "Purchase",
      eventId: payload.eventId,
      orderId: order.id,
      userId: order.userId,
      consent,
      sourceUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      customData: {
        currency: payload.currency,
        value: payload.value,
        content_ids: payload.contentIds,
        contents: payload.contents,
        content_type: "product",
        num_items: payload.numItems,
        order_id: payload.orderId,
      },
      userData: {
        email: order.email,
        phone: order.phone,
        ...splitName(order.name),
        externalId: order.userId || undefined,
        ip,
        userAgent,
        fbp: context.fbp,
        fbc: context.fbc,
        city: context.city,
        region: context.region,
        postcode: context.postcode,
        country: context.country,
      },
    });
  } catch {
    logError("meta_event", { event: "Purchase", eventId: payload.eventId, status: "FAILED" });
  }
}

export async function retryPurchaseEvent(id: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const, message: "Database unavailable." };
  const row = await prisma.metaEvent.findUnique({ where: { id } });
  if (!row || row.status === "SENT") return { ok: false as const, message: "That event was already sent." };
  if (row.eventName !== "Purchase" || !row.orderId) return { ok: false as const, message: "Only a failed purchase can be rebuilt from the order." };
  const order = await prisma.order.findUnique({ where: { id: row.orderId }, include: { items: true } });
  if (!order || order.paymentStatus !== "PAID") return { ok: false as const, message: "The order is not paid." };
  await prisma.metaEvent.update({ where: { id }, data: { status: "FAILED", attempts: Math.max(0, row.attempts - 1) } });
  await sendVerifiedPurchase(order);
  const updated = await prisma.metaEvent.findUnique({ where: { eventId: row.eventId } });
  return { ok: true as const, status: updated?.status || "FAILED", eventId: row.eventId };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return {};
  const lastName = parts.slice(1).join(" ");
  return { firstName: parts[0], ...(lastName ? { lastName } : {}) };
}

function requestSignals(request?: Request) {
  const userAgent = request?.headers.get("user-agent") || "";
  const ip = (request?.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() || "";
  return { userAgent, ip };
}

function orderContext(order: { attributionJson: string; addressJson: string }) {
  let source = "";
  let medium = "";
  let campaign = "";
  let fbp = "";
  let fbc = "";
  let city = "";
  let region = "";
  let postcode = "";
  let country = "";
  try {
    const attribution = JSON.parse(order.attributionJson) as {
      lastTouchSource?: string;
      lastTouchMedium?: string;
      lastTouchCampaign?: string;
      fbp?: string;
      fbc?: string;
    };
    source = attribution.lastTouchSource || "";
    medium = attribution.lastTouchMedium || "";
    campaign = attribution.lastTouchCampaign || "";
    fbp = attribution.fbp || "";
    fbc = attribution.fbc || "";
  } catch {
    /* Attribution is optional. */
  }
  try {
    const address = JSON.parse(order.addressJson) as { city?: string; region?: string; postcode?: string; country?: string };
    city = address.city || "";
    region = address.region || "";
    postcode = address.postcode || "";
    country = address.country || "";
  } catch {
    /* Address is optional for matching. */
  }
  return { source, medium, campaign, fbp, fbc, city, region, postcode, country };
}

export async function sendPaymentInfo(orderId: string, request?: Request) {
  const prisma = db();
  if (!prisma) return;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order?.razorpayOrderId) return;
  const consent: ConsentChoice = { necessary: true, analytics: order.analyticsConsent, advertising: order.marketingConsent };
  const contents = order.items.map((item) => ({ id: item.productId, quantity: item.quantity, item_price: item.unitMinor / 100 }));
  const signals = requestSignals(request);
  try {
    const context = orderContext(order);
    if (canRecordAnalytics(consent)) {
      await prisma.analyticsEvent.create({
        data: {
          name: "AddPaymentInfo",
          eventId: paymentInfoEventId(order.id),
          userId: order.userId || "",
          contentIds: order.items.map((item) => item.productId).join(",").slice(0, 400),
          valueMinor: order.totalMinor,
          currency: order.currency,
          source: context.source.slice(0, 120),
          medium: context.medium.slice(0, 120),
          campaign: context.campaign.slice(0, 120),
        },
      });
    }
    await sendMetaServerEvent({
      eventName: "AddPaymentInfo",
      eventId: paymentInfoEventId(order.id),
      orderId: order.id,
      userId: order.userId,
      consent,
      sourceUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      customData: {
        currency: order.currency,
        value: order.totalMinor / 100,
        content_ids: order.items.map((item) => item.productId),
        contents,
        content_type: "product",
        num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      },
      userData: {
        email: order.email,
        phone: order.phone,
        externalId: order.userId || undefined,
        fbp: context.fbp,
        fbc: context.fbc,
        city: context.city,
        region: context.region,
        postcode: context.postcode,
        country: context.country,
        ...signals,
      },
    });
  } catch {
    logError("meta_event", { event: "AddPaymentInfo", eventId: paymentInfoEventId(order.id), status: "FAILED" });
  }
}

export async function recordPaymentOutcome(input: {
  orderId: string;
  eventName: "PaymentFailed" | "PaymentCancelled";
  eventId: string;
  request?: Request;
}) {
  const prisma = db();
  if (!prisma || !input.orderId || !input.eventId) return;
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return;
  const consent: ConsentChoice = { necessary: true, analytics: order.analyticsConsent, advertising: order.marketingConsent };
  const context = orderContext(order);
  const eventId = input.eventId.slice(0, 120);
  try {
    if (canRecordAnalytics(consent)) {
      const existing = await prisma.analyticsEvent.findFirst({ where: { eventId } });
      if (!existing) {
        await prisma.analyticsEvent.create({
          data: {
            name: input.eventName,
            eventId,
            userId: order.userId || "",
            path: `/checkout`,
            contentIds: order.items.map((item) => item.productId).join(",").slice(0, 400),
            valueMinor: order.totalMinor,
            currency: order.currency,
            source: context.source.slice(0, 120),
            medium: context.medium.slice(0, 120),
            campaign: context.campaign.slice(0, 120),
          },
        });
      }
    }
    await sendMetaServerEvent({
      eventName: input.eventName,
      eventId,
      orderId: order.id,
      userId: order.userId,
      consent,
      sourceUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      customData: {
        currency: order.currency,
        value: order.totalMinor / 100,
        content_ids: order.items.map((item) => item.productId),
        content_type: "product",
        order_id: order.number,
      },
      userData: {
        email: order.email,
        phone: order.phone,
        externalId: order.userId || undefined,
        fbp: context.fbp,
        fbc: context.fbc,
        city: context.city,
        region: context.region,
        postcode: context.postcode,
        country: context.country,
        ...requestSignals(input.request),
      },
    });
  } catch {
    logError("meta_event", { event: input.eventName, eventId, status: "FAILED" });
  }
}

export async function sendRegistration(user: { id: string; email: string }, request: Request) {
  const consent = consentFromRequest(request);
  try {
    await sendMetaServerEvent({
      eventName: "CompleteRegistration",
      eventId: registrationEventId(user.id),
      userId: user.id,
      consent,
      sourceUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      userData: { email: user.email, externalId: user.id, ...requestSignals(request) },
    });
  } catch {
    logError("meta_event", { event: "CompleteRegistration", eventId: registrationEventId(user.id), status: "FAILED" });
  }
}

export async function sendContact(ticket: { id: string; email: string; userId: string | null }, request: Request) {
  const consent = consentFromRequest(request);
  try {
    await sendMetaServerEvent({
      eventName: "Contact",
      eventId: contactEventId(ticket.id),
      userId: ticket.userId,
      consent,
      sourceUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      userData: { email: ticket.email, externalId: ticket.userId || undefined, ...requestSignals(request) },
    });
  } catch {
    logError("meta_event", { event: "Contact", eventId: contactEventId(ticket.id), status: "FAILED" });
  }
}
