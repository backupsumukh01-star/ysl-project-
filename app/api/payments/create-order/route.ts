import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { checkoutSchema } from "@/lib/validators";
import { getCustomer } from "@/lib/auth";
import { createCheckoutOrder } from "@/lib/commerce";
import { razorpayPublic } from "@/lib/payments/razorpay";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { consentFromRequest } from "@/lib/analytics/consent";
import { sendPaymentInfo } from "@/lib/analytics/purchase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`checkout:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many checkout attempts. Wait and try again.", 429);
  }
  const parsed = checkoutSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the checkout details.", 400);
  const user = await getCustomer();
  if (user && user.email !== parsed.data.address.email) {
    return fail("EMAIL_MISMATCH", "Use the email on your account.");
  }
  const consent = consentFromRequest(request);
  const result = await createCheckoutOrder({
    lines: parsed.data.lines,
    address: parsed.data.address,
    couponCode: parsed.data.couponCode,
    userId: user?.id || null,
    idempotencyKey: parsed.data.idempotencyKey,
    marketingConsent: consent.advertising,
    analyticsConsent: consent.analytics,
    attribution: parsed.data.attribution,
  });
  if (!result.ok) return fail(result.code, result.message, result.code === "PAYMENT_NOT_CONFIGURED" ? 503 : 400);
  await sendPaymentInfo(result.orderId, request);
  const payment = razorpayPublic();
  return ok({
    orderId: result.orderId,
    number: result.number,
    currency: result.currency,
    amountMinor: result.amountMinor,
    subtotal: result.subtotal,
    discount: result.discount,
    shipping: result.shipping,
    tax: result.tax,
    total: result.total,
    razorpayOrderId: result.razorpayOrderId,
    keyId: payment.keyId,
  });
}
