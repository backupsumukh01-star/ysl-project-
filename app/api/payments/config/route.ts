import { ok } from "@/lib/http";
import { razorpayPublic } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  const payment = razorpayPublic();
  return ok({ configured: payment.configured, keyId: payment.configured ? payment.keyId : "", environment: payment.environment });
}
