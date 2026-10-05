import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { confirmCapturedPayment, verifyPaymentSignature } from "@/lib/payments/razorpay";
import { markOrderPaid, markVerificationFailed } from "@/lib/commerce";
import { setReceiptCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Payment details were incomplete.");
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Orders are not available.", 503);
  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order || order.razorpayOrderId !== parsed.data.razorpay_order_id) {
    return fail("ORDER_NOT_FOUND", "That payment does not match an order.", 404);
  }
  const valid = verifyPaymentSignature(parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature);
  if (!valid) {
    await markVerificationFailed(order.id);
    logInfo("payment_verification", { order: order.number, status: "failed" });
    return fail("PAYMENT_VERIFICATION_FAILED", "The payment could not be verified.", 400);
  }
  if (order.paymentStatus === "PAID") {
    const existing = await prisma.payment.findFirst({ where: { orderId: order.id, razorpayPaymentId: parsed.data.razorpay_payment_id } });
    if (!existing) return fail("PAYMENT_VERIFICATION_FAILED", "That payment does not match the recorded charge.", 400);
    return ok({ orderId: order.id, number: order.number, duplicate: true });
  }
  const confirmed = await confirmCapturedPayment({
    amountMinor: order.totalMinor,
    currency: order.currency,
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
  });
  if (!confirmed.ok) {
    logInfo("payment_verification", { order: order.number, status: "unconfirmed" });
    return fail("PAYMENT_VERIFICATION_FAILED", "The payment provider did not confirm this charge.", 400);
  }
  const paid = await markOrderPaid({
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
    request,
  });
  if (!paid.ok) return fail(paid.code, "The payment could not be recorded.", 500);
  await setReceiptCookie(order.id);
  return ok({
    orderId: order.id,
    number: order.number,
    duplicate: paid.duplicate,
    purchase: paid.duplicate ? undefined : paid.purchase,
  });
}
