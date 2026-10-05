import { db } from "@/lib/db";
import { minorToMajor } from "@/lib/crypto";

type Address = { city?: string; region?: string; country?: string };
type Touch = { lastTouchSource?: string; lastTouchMedium?: string; lastTouchCampaign?: string; firstTouchSource?: string; firstTouchCampaign?: string };

export type AudienceReport = {
  generatedAt: string;
  windowHours: number;
  metaConfigured: boolean;
  funnel: {
    visits: number;
    visitors: number;
    productViews: number;
    addToCart: number;
    checkoutStarts: number;
    razorpayOpened: number;
    paid: number;
    failed: number;
    leftWindow: number;
  };
  byState: { state: string; country: string; orders: number; paid: number; failed: number; opened: number }[];
  byCampaign: { source: string; campaign: string; visits: number; carts: number; opened: number; paid: number; failed: number }[];
  interest: { name: string; views: number; carts: number; checkouts: number; paid: number }[];
  people: {
    at: string;
    number: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    source: string;
    campaign: string;
    products: string;
    step: string;
    total: number | null;
    currency: string;
    inWindow: boolean;
  }[];
  activity: { at: string; name: string; campaign: string; source: string; device: string; products: string; session: string }[];
};

function readJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function stepOf(paymentStatus: string, hasRazorpay: boolean) {
  if (paymentStatus === "PAID") return "Paid";
  if (paymentStatus === "FAILED") return "Payment failed";
  if (hasRazorpay) return "Opened Razorpay";
  return "Checkout started";
}

export async function audienceReport(now = new Date()): Promise<AudienceReport | null> {
  const prisma = db();
  if (!prisma) return null;
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [events, orders] = await Promise.all([
    prisma.analyticsEvent.findMany({ where: { createdAt: { gte: week } }, orderBy: { createdAt: "desc" }, take: 2000 }),
    prisma.order.findMany({ where: { createdAt: { gte: week } }, include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const dayEvents = events.filter((event) => event.createdAt >= since);
  const dayOrders = orders.filter((order) => order.createdAt >= since);
  const sessions = new Set(dayEvents.filter((event) => event.name === "PageView" && event.sessionId).map((event) => event.sessionId));
  const count = (name: string) => dayEvents.filter((event) => event.name === name).length;
  const productIds = new Set<string>();
  for (const event of events) event.contentIds.split(",").filter(Boolean).forEach((id) => productIds.add(id));
  for (const order of orders) order.items.forEach((item) => productIds.add(item.productId));
  const products = productIds.size
    ? await prisma.product.findMany({ where: { id: { in: [...productIds] } }, select: { id: true, name: true } })
    : [];
  const names = new Map(products.map((product) => [product.id, product.name]));
  const label = (ids: string) =>
    ids
      .split(",")
      .filter(Boolean)
      .map((id) => names.get(id) || "Product")
      .join(", ");

  const interest = new Map<string, { views: number; carts: number; checkouts: number; paid: number }>();
  const bump = (id: string, key: "views" | "carts" | "checkouts" | "paid") => {
    const row = interest.get(id) || { views: 0, carts: 0, checkouts: 0, paid: 0 };
    row[key] += 1;
    interest.set(id, row);
  };
  for (const event of dayEvents) {
    const ids = event.contentIds.split(",").filter(Boolean);
    for (const id of ids) {
      if (event.name === "ViewContent") bump(id, "views");
      if (event.name === "AddToCart") bump(id, "carts");
      if (event.name === "InitiateCheckout") bump(id, "checkouts");
    }
  }
  for (const order of dayOrders.filter((order) => order.paymentStatus === "PAID")) {
    for (const item of order.items) bump(item.productId, "paid");
  }

  const states = new Map<string, { state: string; country: string; orders: number; paid: number; failed: number; opened: number }>();
  const campaigns = new Map<string, { source: string; campaign: string; visits: number; carts: number; opened: number; paid: number; failed: number }>();
  const campaignRow = (source: string, campaign: string) => {
    const key = `${source}||${campaign}`;
    const row = campaigns.get(key) || { source: source || "direct", campaign: campaign || "none", visits: 0, carts: 0, opened: 0, paid: 0, failed: 0 };
    campaigns.set(key, row);
    return row;
  };
  for (const event of dayEvents) {
    const row = campaignRow(event.source, event.campaign);
    if (event.name === "PageView") row.visits += 1;
    if (event.name === "AddToCart") row.carts += 1;
  }
  for (const order of dayOrders) {
    const address = readJson<Address>(order.addressJson);
    const state = address?.region || "Unknown";
    const country = address?.country || "";
    const key = `${state}||${country}`;
    const row = states.get(key) || { state, country, orders: 0, paid: 0, failed: 0, opened: 0 };
    row.orders += 1;
    if (order.paymentStatus === "PAID") row.paid += 1;
    else if (order.paymentStatus === "FAILED") row.failed += 1;
    else if (order.razorpayOrderId) row.opened += 1;
    states.set(key, row);
    const touch = readJson<Touch>(order.attributionJson);
    const campaign = campaignRow(touch?.lastTouchSource || touch?.firstTouchSource || "", touch?.lastTouchCampaign || touch?.firstTouchCampaign || "");
    if (order.razorpayOrderId) campaign.opened += 1;
    if (order.paymentStatus === "PAID") campaign.paid += 1;
    if (order.paymentStatus === "FAILED") campaign.failed += 1;
  }

  return {
    generatedAt: now.toISOString(),
    windowHours: 24,
    metaConfigured: Boolean(process.env.META_ACCESS_TOKEN && (process.env.META_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID)),
    funnel: {
      visits: count("PageView"),
      visitors: sessions.size,
      productViews: count("ViewContent"),
      addToCart: count("AddToCart"),
      checkoutStarts: count("InitiateCheckout"),
      razorpayOpened: dayOrders.filter((order) => order.razorpayOrderId).length,
      paid: dayOrders.filter((order) => order.paymentStatus === "PAID").length,
      failed: dayOrders.filter((order) => order.paymentStatus === "FAILED").length,
      leftWindow: count("PaymentCancelled"),
    },
    byState: [...states.values()].sort((a, b) => b.orders - a.orders),
    byCampaign: [...campaigns.values()].sort((a, b) => b.paid - a.paid || b.opened - a.opened || b.carts - a.carts || b.visits - a.visits).slice(0, 12),
    interest: [...interest.entries()]
      .map(([id, row]) => ({ name: names.get(id) || "Product", ...row }))
      .sort((a, b) => b.paid - a.paid || b.carts - a.carts || b.views - a.views)
      .slice(0, 8),
    people: orders.slice(0, 80).map((order) => {
      const address = readJson<Address>(order.addressJson);
      const touch = readJson<Touch>(order.attributionJson);
      return {
        at: order.createdAt.toISOString(),
        number: order.number,
        name: order.name,
        email: order.email,
        phone: order.phone,
        city: address?.city || "",
        state: address?.region || "",
        country: address?.country || "",
        source: touch?.lastTouchSource || touch?.firstTouchSource || "",
        campaign: touch?.lastTouchCampaign || touch?.firstTouchCampaign || "",
        products: order.items.map((item) => `${item.name} × ${item.quantity}`).join(", "),
        step: stepOf(order.paymentStatus, Boolean(order.razorpayOrderId)),
        total: minorToMajor(order.totalMinor),
        currency: order.currency,
        inWindow: order.createdAt >= since,
      };
    }),
    activity: dayEvents.slice(0, 40).map((event) => ({
      at: event.createdAt.toISOString(),
      name: event.name,
      campaign: event.campaign,
      source: event.source,
      device: event.device,
      products: label(event.contentIds),
      session: event.sessionId ? event.sessionId.slice(0, 8) : "",
    })),
  };
}

export function audienceDigestText(report: AudienceReport) {
  const funnel = report.funnel;
  const lines = [
    `Last ${report.windowHours} hours`,
    `Visits ${funnel.visits} from ${funnel.visitors} browsers`,
    `Product views ${funnel.productViews}`,
    `Added to bag ${funnel.addToCart}`,
    `Checkout ${funnel.checkoutStarts}`,
    `Opened Razorpay ${funnel.razorpayOpened}`,
    `Paid ${funnel.paid}`,
    `Payment failed ${funnel.failed}`,
    `Closed the payment window ${funnel.leftWindow}`,
    "",
    "States",
    ...(report.byState.slice(0, 8).map((row) => `${row.state}${row.country ? `, ${row.country}` : ""}: ${row.orders} orders, ${row.paid} paid, ${row.failed} failed`) || ["No orders in this window."]),
    "",
    "Campaigns",
    ...(report.byCampaign.slice(0, 8).map((row) => `${row.source} / ${row.campaign}: ${row.visits} visits, ${row.carts} bags, ${row.paid} paid`) || ["No campaign visits."]),
    "",
    "People who reached checkout",
    ...(report.people.filter((person) => person.inWindow).slice(0, 20).map((person) => `${person.number} ${person.step} ${person.name} ${person.email} ${person.city} ${person.state} ${person.campaign}`) || ["None in this window."]),
  ];
  return lines.join("\n");
}
