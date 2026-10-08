import { fail, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";
import { minorToMajor } from "@/lib/crypto";
import { customerSegments } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "The database is not configured.", 503);
  const [orders, paid, pending, customers, products, tracked, reviews, tickets, pageViews, productViews, addToCart, checkoutStarts, paymentStarts, measuredPurchases] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.findMany({ where: { trackInventory: true }, select: { stock: true, reserved: true, lowStock: true } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.analyticsEvent.count({ where: { name: "PageView" } }),
    prisma.analyticsEvent.count({ where: { name: "ViewContent" } }),
    prisma.analyticsEvent.count({ where: { name: "AddToCart" } }),
    prisma.analyticsEvent.count({ where: { name: "InitiateCheckout" } }),
    prisma.analyticsEvent.count({ where: { name: "AddPaymentInfo" } }),
    prisma.analyticsEvent.count({ where: { name: "Purchase" } }),
  ]);
  const available = tracked.map((item) => item.stock - item.reserved);
  const lowStock = available.filter((qty, index) => qty > 0 && qty <= tracked[index].lowStock).length;
  const outOfStock = available.filter((qty) => qty <= 0).length;
  const [cancellations, refundedMinor, segments] = await Promise.all([
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.refund.aggregate({ where: { status: "COMPLETED" }, _sum: { amountMinor: true } }),
    customerSegments(),
  ]);
  const revenueMinor = await prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalMinor: true } });
  const revenue = minorToMajor(revenueMinor._sum.totalMinor || 0);
  const paidLines = await prisma.orderItem.findMany({ where: { order: { paymentStatus: "PAID" } }, select: { productId: true, quantity: true } });
  const costRows = paidLines.length
    ? await prisma.product.findMany({ where: { id: { in: [...new Set(paidLines.map((line) => line.productId))] } }, select: { id: true, costMinor: true } })
    : [];
  const costMap = new Map(costRows.map((row) => [row.id, row.costMinor]));
  let productCost = 0;
  let missingCost = paidLines.length === 0;
  for (const line of paidLines) {
    const cost = costMap.get(line.productId);
    if (cost == null) {
      missingCost = true;
      break;
    }
    productCost += cost * line.quantity;
  }
  const contribution = missingCost ? null : minorToMajor((revenueMinor._sum.totalMinor || 0) - productCost - (refundedMinor._sum.amountMinor || 0));
  const topItems = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    where: { order: { paymentStatus: "PAID" } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const campaigns = await prisma.analyticsEvent.groupBy({
    by: ["source", "campaign"],
    where: { campaign: { not: "" } },
    _count: { campaign: true },
  });
  const topCampaigns = [...campaigns].sort((a, b) => b._count.campaign - a._count.campaign).slice(0, 5);
  const metaEvents = await prisma.metaEvent.findMany({ orderBy: { createdAt: "desc" }, take: 8 });
  const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { items: true } });
  const recentReviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 6 });
  const currency = recentOrders[0]?.currency || "USD";
  return ok({
    orders,
    paid,
    pending,
    customers,
    products,
    lowStock,
    outOfStock,
    cancellations,
    refunded: minorToMajor(refundedMinor._sum.amountMinor || 0),
    contribution,
    segments,
    reviews,
    tickets,
    revenue,
    averageOrder: paid && revenue != null ? revenue / paid : null,
    currency,
    funnel: { pageViews, productViews, addToCart, checkoutStarts, paymentStarts, purchases: paid, measuredPurchases },
    topProducts: topItems.map((item) => ({ name: item.name, quantity: item._sum.quantity || 0 })),
    campaigns: topCampaigns.map((item) => ({ source: item.source, campaign: item.campaign, count: item._count.campaign })),
    metaConfigured: Boolean(process.env.META_ACCESS_TOKEN && (process.env.META_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID)),
    metaEvents: metaEvents.map((event) => ({
      id: event.id,
      eventId: event.eventId,
      eventName: event.eventName,
      status: event.status,
      attempts: event.attempts,
      errorMessage: event.errorMessage,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      number: order.number,
      total: minorToMajor(order.totalMinor),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
    })),
    recentReviews: recentReviews.map((review) => ({ id: review.id, rating: review.rating, status: review.status, title: review.title })),
  });
}
