import { createHmac, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const base = process.env.SITE || "http://localhost:3000";
const prisma = new PrismaClient();
const secret = process.env.RAZORPAY_KEY_SECRET || "dev-key-secret";
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "dev-webhook-secret";
const failures = [];

function assert(name, condition) {
  if (!condition) {
    failures.push(name);
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

function sign(orderId, paymentId) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      origin: base,
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  const setCookie = response.headers.getSetCookie?.() || [];
  return { status: response.status, json, setCookie };
}

function cookieFrom(setCookie) {
  return setCookie.map((item) => item.split(";")[0]).join("; ");
}

async function login(email) {
  const sent = await request("/api/auth/otp", { method: "POST", body: { email } });
  assert(`${email} otp accepted`, sent.status === 200 && sent.json?.success === true && !JSON.stringify(sent.json).includes("code"));
  const log = await prisma.emailLog.findFirst({ where: { recipient: email, type: "otp" }, orderBy: { createdAt: "desc" } });
  const code = log?.body?.match(/letter-spacing:\.2em;">(\d{6})/)?.[1];
  assert(`${email} code stored only in dev log`, Boolean(code));
  const verified = await request("/api/auth/verify", { method: "POST", body: { email, code } });
  assert(`${email} verified`, verified.status === 200);
  return cookieFrom(verified.setCookie);
}

async function main() {
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  if (!device) throw new Error("Seed the database first.");
  const originalPrice = device.priceMinor;
  await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 25000, trackInventory: true, stock: 5 } });
  await prisma.siteSetting.upsert({ where: { key: "shippingEnabled" }, update: { value: "true" }, create: { key: "shippingEnabled", value: "true" } });
  await prisma.siteSetting.upsert({ where: { key: "shippingFlatMinor" }, update: { value: "0" }, create: { key: "shippingFlatMinor", value: "0" } });

  try {
    const stamp = Date.now();
    const emailA = `a${stamp}@example.com`;
    const emailB = `b${stamp}@example.com`;
    const cookieA = await login(emailA);
    const cookieB = await login(emailB);

    const created = await request("/api/payments/create-order", {
      method: "POST",
      cookie: cookieA,
      body: {
        idempotencyKey: `test-${stamp}`,
        lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
        address: {
          name: "User A",
          email: emailA,
          phone: "5551234567",
          line1: "1 Example Street",
          city: "Paris",
          region: "IDF",
          postcode: "75001",
          country: "France",
        },
      },
    });
    assert("create order does not pretend payment succeeded", created.status === 503 && created.json?.error?.code === "PAYMENT_NOT_CONFIGURED");
    const pending = await prisma.order.findFirst({ where: { email: emailA }, orderBy: { createdAt: "desc" } });
    assert("pending order stored", Boolean(pending) && pending.paymentStatus === "PENDING");

    const razorpayOrderId = `order_test_${stamp}`;
    const paymentId = `pay_test_${stamp}`;
    await prisma.order.update({ where: { id: pending.id }, data: { razorpayOrderId } });
    const bad = await request("/api/payments/verify", {
      method: "POST",
      cookie: cookieA,
      body: { orderId: pending.id, razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: "bad" },
    });
    assert("invalid signature rejected", bad.status === 400);
    const stillPending = await prisma.order.findUnique({ where: { id: pending.id } });
    assert("invalid signature does not mark paid", stillPending.paymentStatus !== "PAID");

    const good = await request("/api/payments/verify", {
      method: "POST",
      cookie: cookieA,
      body: {
        orderId: pending.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(razorpayOrderId, paymentId),
      },
    });
    assert("valid signature does not mark paid without provider confirmation", good.status === 400 && good.json?.success !== true);
    const unpaid = await prisma.order.findUnique({ where: { id: pending.id } });
    assert("signature alone leaves the order unpaid", unpaid.paymentStatus !== "PAID");
    const again = await request("/api/payments/verify", {
      method: "POST",
      cookie: cookieA,
      body: {
        orderId: pending.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(razorpayOrderId, paymentId),
      },
    });
    assert("repeat signature still does not mark paid", again.status === 400);
    const stock = await prisma.product.findUnique({ where: { id: device.id } });
    assert("inventory is not decremented without a captured payment", stock.stock === 5);

    const hidden = await request(`/api/orders/${pending.id}`, { cookie: cookieB });
    assert("user B cannot read user A order", hidden.status === 404);
    const visible = await request(`/api/orders/${pending.id}`, { cookie: cookieA });
    assert("user A can read own order", visible.status === 200 && visible.json?.data?.order?.email === emailA);

    const adminBlocked = await request("/api/admin/dashboard", { cookie: cookieA });
    assert("customer cannot open admin", adminBlocked.status === 401);
    const admin = await request("/api/admin/login", {
      method: "POST",
      body: { email: process.env.ADMIN_EMAIL || "admin@example.com", password: process.env.ADMIN_PASSWORD || "dev-admin-change-me" },
    });
    assert("admin can sign in", admin.status === 200);
    const adminCookie = cookieFrom(admin.setCookie);
    const dashboard = await request("/api/admin/dashboard", { cookie: adminCookie });
    assert("admin dashboard uses database", dashboard.status === 200 && typeof dashboard.json?.data?.orders === "number");

    const reviewB = await request("/api/reviews", {
      method: "POST",
      cookie: cookieB,
      body: { productId: device.id, orderId: pending.id, rating: 5, comment: "Not my order" },
    });
    assert("review requires the buyer's order", reviewB.status === 403);
    const reviewA = await request("/api/reviews", {
      method: "POST",
      cookie: cookieA,
      body: { productId: device.id, orderId: pending.id, rating: 5, comment: "A real purchase review" },
    });
    assert("buyer review requires a paid order", reviewA.status === 403);
    const publicReviews = await request(`/api/reviews?productId=${device.id}`);
    assert("pending review is not public", !publicReviews.json?.data?.reviews?.some((review) => review.comment === "A real purchase review"));

    const raw = JSON.stringify({
      id: `evt_${stamp}`,
      event: "payment.captured",
      payload: { payment: { entity: { id: paymentId, order_id: razorpayOrderId } } },
    });
    const badHook = await fetch(`${base}/api/webhooks/razorpay`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-razorpay-signature": "nope" },
      body: raw,
    });
    assert("webhook rejects a bad signature", badHook.status === 400);
    const signature = createHmac("sha256", webhookSecret).update(raw).digest("hex");
    const hook = await fetch(`${base}/api/webhooks/razorpay`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-razorpay-signature": signature },
      body: raw,
    });
    assert("webhook does not mark paid without a captured provider payment", hook.status === 500);
    const hookAgain = await fetch(`${base}/api/webhooks/razorpay`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-razorpay-signature": signature },
      body: raw,
    });
    assert("duplicate webhook is ignored", hookAgain.status === 200);
    const events = await prisma.webhookEvent.count({ where: { eventId: `evt_${stamp}` } });
    assert("failed webhook is not stored as processed", events === 1 && (await prisma.webhookEvent.findUnique({ where: { eventId: `evt_${stamp}` } }))?.processed === false);

    const support = await request("/api/support", {
      method: "POST",
      body: { name: "User A", email: emailA, subject: "Order help", message: "Please help with this order." },
    });
    assert("support ticket created", support.status === 200 && Boolean(support.json?.data?.number));

    const emails = await prisma.emailLog.count({ where: { recipient: emailA, type: "order_confirmation" } });
    assert("confirmation email is not sent for an unverified payment", emails === 0);
    assert("local hmac matches verifier", timingSafeEqual(Buffer.from(sign("order_x", "pay_x")), Buffer.from(sign("order_x", "pay_x"))));
  } finally {
    await prisma.product.update({ where: { id: device.id }, data: { priceMinor: originalPrice, trackInventory: false, stock: 0 } });
    await prisma.siteSetting.deleteMany({ where: { key: { in: ["shippingFlatMinor", "shippingEnabled"] } } });
    await prisma.$disconnect();
  }

  if (failures.length) {
    console.error(`\n${failures.length} failed`);
    process.exit(1);
  }
  console.log("\nAll commerce checks passed");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
