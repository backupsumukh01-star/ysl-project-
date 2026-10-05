import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const base = process.env.SITE || "http://localhost:3000";
const prisma = new PrismaClient();
const secret = process.env.RAZORPAY_KEY_SECRET || "dev-key-secret";
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
    headers: { "content-type": "application/json", origin: base, ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: response.status, json, setCookie: response.headers.getSetCookie?.() || [] };
}

function cookieFrom(setCookie) {
  return setCookie.map((item) => item.split(";")[0]).join("; ");
}

async function login(email) {
  await request("/api/auth/otp", { method: "POST", body: { email } });
  const log = await prisma.emailLog.findFirst({ where: { recipient: email, type: "otp" }, orderBy: { createdAt: "desc" } });
  const code = log?.body?.match(/letter-spacing:\.2em;">(\d{6})/)?.[1];
  const verified = await request("/api/auth/verify", { method: "POST", body: { email, code } });
  return cookieFrom(verified.setCookie);
}

async function main() {
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  if (!device) throw new Error("Seed the database first.");
  const original = { priceMinor: device.priceMinor, trackInventory: device.trackInventory, stock: device.stock, reserved: device.reserved };
  const previousShipping = await prisma.siteSetting.findUnique({ where: { key: "shippingFlatMinor" } });
  await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 25000, trackInventory: true, stock: 5, reserved: 0 } });
  await prisma.siteSetting.upsert({ where: { key: "shippingEnabled" }, update: { value: "true" }, create: { key: "shippingEnabled", value: "true" } });
  await prisma.siteSetting.upsert({ where: { key: "shippingFlatMinor" }, update: { value: "0" }, create: { key: "shippingFlatMinor", value: "0" } });
  const stamp = Date.now();
  const emailA = `gap-a${stamp}@example.com`;
  const emailB = `gap-b${stamp}@example.com`;
  let orderId = "";
  try {
    const cookieA = await login(emailA);
    const cookieB = await login(emailB);
    const created = await request("/api/payments/create-order", {
      method: "POST",
      cookie: cookieA,
      body: {
        idempotencyKey: `gap-${stamp}`,
        lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
        address: { name: "User A", email: emailA, phone: "5551234567", line1: "1 Example Street", city: "Paris", region: "IDF", postcode: "75001", country: "France" },
      },
    });
    const pending = await prisma.order.findFirst({ where: { email: emailA }, orderBy: { createdAt: "desc" } });
    orderId = pending?.id || "";
    const reserved = await prisma.product.findUnique({ where: { id: device.id } });
    assert("unconfigured payment does not keep a reservation", created.status === 503 && reserved?.reserved === 0 && Boolean(pending));
    if (!pending) {
      console.error(created.status, JSON.stringify(created.json));
      throw new Error("No pending order");
    }

    const razorpayOrderId = `order_gap_${stamp}`;
    const paymentId = `pay_gap_${stamp}`;
    await prisma.order.update({ where: { id: orderId }, data: { razorpayOrderId } });
    await prisma.product.update({ where: { id: device.id }, data: { reserved: 1 } });
    const paid = await request("/api/payments/verify", {
      method: "POST",
      cookie: cookieA,
      body: { orderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: sign(razorpayOrderId, paymentId) },
    });
    const afterPay = await prisma.product.findUnique({ where: { id: device.id } });
    const paidOrder = await prisma.order.findUnique({ where: { id: orderId } });
    const purchases = await prisma.metaEvent.count({ where: { eventId: `purchase_${orderId}`, eventName: "Purchase" } });
    assert("verified payment sells reserved stock once", paid.status === 200 && afterPay?.stock === 4 && afterPay?.reserved === 0 && paidOrder?.paymentStatus === "PAID" && purchases === 1);

    const leak = await request("/api/track", { method: "POST", body: { number: paidOrder.number, email: emailB } });
    const own = await request("/api/track", { method: "POST", body: { number: paidOrder.number, email: emailA } });
    assert("tracking hides another email", leak.status === 404);
    assert("tracking shows the matching email", own.status === 200 && own.json?.data?.tracking?.number === paidOrder.number);

    const stranger = await request(`/api/orders/${orderId}/cancel`, { method: "POST", cookie: cookieB });
    assert("another customer cannot cancel", stranger.status === 404 || stranger.status === 400);
    const cancelled = await request(`/api/orders/${orderId}/cancel`, { method: "POST", cookie: cookieA });
    const refund = await prisma.refund.findFirst({ where: { orderId } });
    const restored = await prisma.product.findUnique({ where: { id: device.id } });
    assert("paid unshipped cancel restores stock and does not complete the refund", cancelled.status === 200 && restored?.stock === 5 && refund?.status !== "COMPLETED");

    await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED", paymentStatus: "PAID" } });
    const shippedCancel = await request(`/api/orders/${orderId}/cancel`, { method: "POST", cookie: cookieA });
    assert("shipped order is not cancelled from the account", shippedCancel.status === 409);
    const earlyReturn = await request(`/api/orders/${orderId}/return`, { method: "POST", cookie: cookieA, body: { reason: "Changed mind", items: [{ productId: device.id, quantity: 1 }] } });
    assert("return is accepted after shipping", earlyReturn.status === 200);
    const guestReturn = await request(`/api/orders/${orderId}/return`, { method: "POST", body: { reason: "Changed mind", items: [{ productId: device.id, quantity: 1 }] } });
    assert("return requires the account", guestReturn.status === 401);

    const guestWish = await request("/api/wishlist", { method: "PUT", body: { items: [{ productId: device.id }] } });
    assert("guest wishlist is not stored", guestWish.status === 401);
    const saved = await request("/api/wishlist", { method: "PUT", cookie: cookieA, body: { items: [{ productId: device.id }] } });
    const listed = await request("/api/wishlist", { cookie: cookieA });
    assert("signed-in wishlist is saved", saved.status === 200 && listed.json?.data?.items?.some((item) => item.id === device.id));

    const alertEmail = `stock${stamp}@example.com`;
    const first = await request("/api/stock-alerts", { method: "POST", body: { email: alertEmail, productId: device.id } });
    const second = await request("/api/stock-alerts", { method: "POST", body: { email: alertEmail, productId: device.id } });
    const alerts = await prisma.stockAlert.count({ where: { email: alertEmail, productId: device.id } });
    assert("stock alert is stored once", first.status === 200 && second.status === 200 && alerts === 1);

    const feed = await request("/api/feeds/google");
    assert("google feed is xml and does not claim merchant center", feed.status === 200 && String(feed.json).includes("Merchant Center is not connected"));
  } finally {
    await prisma.product.update({ where: { id: device.id }, data: original });
    if (previousShipping) await prisma.siteSetting.update({ where: { key: "shippingFlatMinor" }, data: { value: previousShipping.value } });
    else await prisma.siteSetting.deleteMany({ where: { key: "shippingFlatMinor" } });
    await prisma.siteSetting.deleteMany({ where: { key: "shippingEnabled" } });
    const users = await prisma.user.findMany({ where: { email: { in: [emailA, emailB] } } });
    const userIds = users.map((user) => user.id);
    if (orderId) {
      await prisma.returnRequest.deleteMany({ where: { orderId } });
      await prisma.refund.deleteMany({ where: { orderId } });
      await prisma.metaEvent.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    await prisma.wishlistItem.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.stockAlert.deleteMany({ where: { email: { contains: String(stamp) } } });
    await prisma.emailLog.deleteMany({ where: { recipient: { contains: String(stamp) } } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }
  if (failures.length) {
    console.error(`\n${failures.length} failed`);
    process.exit(1);
  }
  console.log("\nAll fulfillment checks passed");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
