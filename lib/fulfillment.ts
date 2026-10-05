import { db } from "@/lib/db";
import { getCustomer } from "@/lib/auth";
import { releaseInventory, restoreSoldInventory } from "@/lib/inventory";
import { receiptFromOrder } from "@/lib/email/order-notice";
import { sendEmail, sendOwnerEmail } from "@/lib/email/service";
import { createRazorpayRefund } from "@/lib/payments/razorpay";
import { logError, logInfo } from "@/lib/logger";

const SHIPPED = new Set(["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "RETURN_REQUESTED", "RETURNED", "FAILED_DELIVERY", "RETURN_TO_ORIGIN"]);
const CANCELLABLE = new Set(["PAID", "PROCESSING", "PACKED"]);

export const timelineSteps = ["PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"] as const;

export function trackingView(order: {
  number: string;
  status: string;
  paymentStatus: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  shipmentId: string;
  deliveryEstimate: string;
  shippingMethod: string;
  createdAt: Date;
}) {
  return {
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    courier: order.courier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    shipmentId: order.shipmentId,
    deliveryEstimate: order.deliveryEstimate,
    shippingMethod: order.shippingMethod,
    steps: timelineSteps.map((step) => ({
      status: step,
      reached: timelineSteps.indexOf(step) <= timelineSteps.indexOf(order.status as (typeof timelineSteps)[number]),
    })),
    createdAt: order.createdAt.toISOString(),
  };
}

export async function lookupTracking(input: { number: string; email: string }) {
  const prisma = db();
  if (!prisma) return null;
  const order = await prisma.order.findUnique({ where: { number: input.number.trim() } });
  if (!order || order.email.toLowerCase() !== input.email.trim().toLowerCase()) return null;
  return trackingView(order);
}

export async function requestCancellation(orderId: string, userId: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const, code: "UNAVAILABLE", message: "Orders are not available." };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true, items: true } });
  if (!order || order.userId !== userId) return { ok: false as const, code: "NOT_FOUND", message: "That order was not found." };
  if (SHIPPED.has(order.status)) {
    return { ok: false as const, code: "SHIPPED", message: "This order has already moved into shipping. Use the return request or contact support." };
  }
  if (order.paymentStatus !== "PAID" || !CANCELLABLE.has(order.status)) {
    if (order.paymentStatus !== "PAID") {
      await releaseInventory(order.id);
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: order.paymentStatus === "PAID" ? order.paymentStatus : "FAILED" } });
      return { ok: true as const, message: "The unpaid order was cancelled. No charge was recorded." };
    }
    return { ok: false as const, code: "NOT_CANCELLABLE", message: "This order cannot be cancelled from the account page." };
  }
  await restoreSoldInventory(order.id);
  await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  const payment = order.payments.find((item) => item.razorpayPaymentId);
  const refund = await prisma.refund.create({
    data: {
      orderId: order.id,
      paymentId: payment?.id || "",
      amountMinor: order.totalMinor,
      reason: "Customer cancellation before shipment",
      status: "PENDING",
    },
  });
  if (payment?.razorpayPaymentId) {
    const provider = await createRazorpayRefund(payment.razorpayPaymentId, order.totalMinor);
    await prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: provider.ok ? "PROCESSING" : "FAILED",
        providerReference: provider.ok ? provider.id : "",
      },
    });
    if (provider.ok) await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUND_PENDING" } });
  }
  const cancelled = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  if (cancelled) {
    const notice = receiptFromOrder(cancelled, {
      title: "Order cancelled",
      note: "The order was cancelled before shipment. A refund is recorded only after the payment provider confirms it.",
    });
    await sendEmail({ to: cancelled.email, type: "order_cancelled", dedupeKey: `order_cancelled:${cancelled.id}`, ...notice });
    await sendOwnerEmail({ type: "admin_cancellation", dedupeKey: `admin_cancellation:${cancelled.id}`, ...notice });
  }
  logInfo("order_cancelled", { order: order.number });
  return { ok: true as const, message: "Cancellation recorded. A refund is not marked complete until the payment provider confirms it." };
}

export async function createReturnRequest(input: { orderId: string; userId: string; reason: string; description: string; items: { productId: string; quantity: number }[] }) {
  const prisma = db();
  if (!prisma) return { ok: false as const, message: "Returns are not available." };
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { items: true } });
  if (!order || order.userId !== input.userId) return { ok: false as const, message: "That order was not found." };
  if (!["SHIPPED", "DELIVERED", "OUT_FOR_DELIVERY"].includes(order.status)) {
    return { ok: false as const, message: "A return can be requested after the order has shipped. The return policy itself has not been published yet." };
  }
  const created = await prisma.returnRequest.create({
    data: {
      orderId: order.id,
      userId: input.userId,
      reason: input.reason.slice(0, 160),
      description: input.description.slice(0, 2000),
      itemsJson: JSON.stringify(input.items.slice(0, 20)),
      status: "REQUESTED",
    },
  });
  await prisma.order.update({ where: { id: order.id }, data: { status: "RETURN_REQUESTED" } });
  const notice = receiptFromOrder(order, {
    title: "Return requested",
    note: "The request is waiting for review. A refund has not been made. A return policy has not been published yet.",
  });
  await sendEmail({ to: order.email, type: "return_requested", dedupeKey: `return_requested:${created.id}`, ...notice });
  await sendOwnerEmail({
    type: "admin_return",
    dedupeKey: `admin_return:${created.id}`,
    ...receiptFromOrder(order, { title: "Return requested", note: input.reason.slice(0, 160) }),
  });
  return { ok: true as const, id: created.id };
}

export async function recordRisk(email: string, kind: string, note: string) {
  const prisma = db();
  if (!prisma) return;
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.paymentEvent.count({ where: { type: "verification_failed", createdAt: { gt: since } } }).catch(() => 0);
  if (kind === "failed_payment" && recent < 5) return;
  await prisma.riskFlag.create({ data: { email, kind, note: note.slice(0, 200), score: Math.min(recent, 10) } });
  logError("risk_flag", { kind });
}

export async function customerSegments() {
  const prisma = db();
  if (!prisma) return [];
  const [customers, paidOrders, carts] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { email: true } }),
    prisma.cart.count({ where: { abandonedAt: { not: null }, status: "ABANDONED" } }),
  ]);
  const counts = new Map<string, number>();
  for (const order of paidOrders) counts.set(order.email, (counts.get(order.email) || 0) + 1);
  const buyers = counts.size;
  const repeat = [...counts.values()].filter((count) => count > 1).length;
  return [
    { key: "REGISTERED", count: customers },
    { key: "FIRST_TIME_BUYER", count: buyers - repeat },
    { key: "REPEAT_BUYER", count: repeat },
    { key: "PURCHASER", count: buyers },
    { key: "CART_ABANDONER", count: carts },
  ];
}

export async function requireOwnedOrder(orderId: string) {
  const user = await getCustomer();
  if (!user) return null;
  const prisma = db();
  if (!prisma) return null;
  return prisma.order.findFirst({ where: { id: orderId, userId: user.id }, include: { items: true, payments: true } });
}
