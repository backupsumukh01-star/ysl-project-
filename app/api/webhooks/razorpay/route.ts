import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { confirmCapturedPayment, verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markOrderPaid, markPaymentFailed, markRefunded } from "@/lib/commerce";
import { formatMoney } from "@/lib/product";
import { fromMinor } from "@/lib/fx";
import { orderEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";

export const dynamic = "force-dynamic";

type EventBody = {
  id?: string;
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    refund?: { entity?: { payment_id?: string; amount?: number } };
    order?: { entity?: { id?: string } };
  };
};

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, signature)) {
    logInfo("webhook_event", { status: "invalid_signature" });
    return new Response("Invalid signature", { status: 400 });
  }
  const prisma = db();
  if (!prisma) return new Response("Database unavailable", { status: 503 });
  let body: EventBody;
  try {
    body = JSON.parse(raw) as EventBody;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }
  const eventId = body.id || createHmac("sha256", "event").update(raw).digest("hex");
  const eventType = body.event || "unknown";
  const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
  if (existing?.processed) return new Response("ok", { status: 200 });
  if (!existing) {
    await prisma.webhookEvent.create({ data: { eventId, eventType, payload: raw.slice(0, 20000) } });
  }
  try {
    const payment = body.payload?.payment?.entity;
    if ((eventType === "payment.captured" || eventType === "order.paid") && payment?.order_id && payment.id) {
      await requireCapturedMatch(payment.order_id, payment.id);
      const paid = await markOrderPaid({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id });
      if (!paid.ok) throw new Error("payment not recorded");
    } else if (eventType === "order.paid" && body.payload?.order?.entity?.id) {
      const order = await prisma.order.findFirst({ where: { razorpayOrderId: body.payload.order.entity.id } });
      if (order) {
        const row = await prisma.payment.findFirst({ where: { orderId: order.id } });
        if (row?.razorpayPaymentId) {
          await requireCapturedMatch(order.razorpayOrderId, row.razorpayPaymentId);
          const paid = await markOrderPaid({ razorpayOrderId: order.razorpayOrderId, razorpayPaymentId: row.razorpayPaymentId });
          if (!paid.ok) throw new Error("payment not recorded");
        }
      }
    } else if (eventType === "payment.failed" && payment?.order_id) {
      await markPaymentFailed(payment.order_id);
    } else if (eventType === "refund.created" || eventType === "refund.processed") {
      const refund = body.payload?.refund?.entity;
      const paymentId = refund?.payment_id || "";
      if (eventType === "refund.processed") await markRefunded(paymentId, await refundIsPartial(paymentId, refund?.amount));
      else await noteRefundCreated(paymentId);
    }
    await prisma.webhookEvent.update({ where: { eventId }, data: { processed: true, processedAt: new Date(), error: "" } });
    logInfo("webhook_event", { eventType, status: "processed" });
    return new Response("ok", { status: 200 });
  } catch {
    await prisma.webhookEvent.update({ where: { eventId }, data: { processed: false, error: "processing failed" } }).catch(() => undefined);
    logError("webhook_event", { eventType, status: "failed" });
    return new Response("retry", { status: 500 });
  }
}

async function requireCapturedMatch(razorpayOrderId: string, razorpayPaymentId: string) {
  const prisma = db();
  if (!prisma) throw new Error("database unavailable");
  const order = await prisma.order.findFirst({ where: { razorpayOrderId } });
  if (!order) throw new Error("order missing");
  if (order.paymentStatus === "PAID") return;
  const confirmed = await confirmCapturedPayment({
    amountMinor: order.totalMinor,
    currency: order.currency,
    razorpayOrderId,
    razorpayPaymentId,
  });
  if (!confirmed.ok) throw new Error("payment not confirmed");
}

async function refundIsPartial(paymentId: string, amount: number | undefined) {
  if (!paymentId || !Number.isInteger(amount) || amount == null || amount <= 0) return false;
  const prisma = db();
  if (!prisma) return false;
  const payment = await prisma.payment.findFirst({ where: { razorpayPaymentId: paymentId } });
  if (!payment) return false;
  const order = await prisma.order.findUnique({ where: { id: payment.orderId } });
  if (!order) return false;
  return amount < order.totalMinor;
}

async function noteRefundCreated(paymentId: string) {
  const prisma = db();
  if (!prisma || !paymentId) return;
  const payment = await prisma.payment.findFirst({ where: { razorpayPaymentId: paymentId } });
  if (!payment || payment.status === "REFUNDED" || payment.status === "REFUND_PENDING") return;
  await prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUND_PENDING" } });
  const order = await prisma.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: "REFUND_PENDING", status: "REFUND_REQUESTED" },
  });
  await sendEmail({
    to: order.email,
    type: "refund_initiated",
    dedupeKey: `refund_initiated:${order.id}`,
    ...orderEmail({
      title: "Refund initiated",
      number: order.number,
      total: formatMoney(fromMinor(order.totalMinor, order.currency), order.currency),
      note: "A refund was started with the payment provider.",
    }),
  });
}
