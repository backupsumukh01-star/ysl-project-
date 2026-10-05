import { createHmac, timingSafeEqual } from "crypto";
import { logError, logInfo } from "@/lib/logger";
import { paymentMatchesOrder, type CapturedPayment } from "./payment-match.mjs";

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayPublic() {
  return {
    configured: razorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID || "",
    environment: process.env.RAZORPAY_ENVIRONMENT || "test",
  };
}

export function signPayment(orderId: string, paymentId: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = signPayment(orderId, paymentId);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function fetchCapturedPayment(paymentId: string): Promise<{ ok: true; payment: CapturedPayment } | { ok: false; error: string }> {
  if (!razorpayConfigured()) return { ok: false, error: "Razorpay is not configured." };
  const key = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const payload = (await response.json().catch(() => ({}))) as CapturedPayment & { error?: { description?: string } };
    if (!response.ok) {
      logError("payment_lookup", { status: response.status });
      return { ok: false, error: payload.error?.description || "The payment provider did not confirm this payment." };
    }
    return { ok: true, payment: payload };
  } catch {
    logError("payment_lookup", { status: "network" });
    return { ok: false, error: "The payment provider could not be reached." };
  }
}

export async function confirmCapturedPayment(expected: { amountMinor: number; currency: string; razorpayOrderId: string; razorpayPaymentId: string }) {
  const looked = await fetchCapturedPayment(expected.razorpayPaymentId);
  if (!looked.ok) return looked;
  if (!paymentMatchesOrder(looked.payment, expected)) {
    logError("payment_lookup", { status: "mismatch" });
    return { ok: false as const, error: "The captured payment does not match this order." };
  }
  return { ok: true as const };
}

export async function createRazorpayOrder(input: { amountMinor: number; currency: string; receipt: string }) {
  if (!razorpayConfigured()) {
    return { ok: false as const, error: "Razorpay is not configured." };
  }
  const key = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: input.amountMinor,
        currency: input.currency,
        receipt: input.receipt,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { id?: string; error?: { description?: string } };
    if (!response.ok || !payload.id) {
      logError("payment_initialization", { status: response.status });
      return { ok: false as const, error: payload.error?.description || "Razorpay did not create an order." };
    }
    logInfo("payment_initialization", { receipt: input.receipt });
    return { ok: true as const, id: payload.id };
  } catch {
    logError("payment_initialization", { status: "network" });
    return { ok: false as const, error: "Razorpay could not be reached." };
  }
}

export async function createRazorpayRefund(paymentId: string, amountMinor: number) {
  if (!razorpayConfigured()) return { ok: false as const, error: "Razorpay is not configured." };
  const key = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountMinor }),
  });
  const payload = (await response.json().catch(() => ({}))) as { id?: string; error?: { description?: string } };
  if (!response.ok) return { ok: false as const, error: payload.error?.description || "Refund was not created." };
  return { ok: true as const, id: payload.id || "" };
}
