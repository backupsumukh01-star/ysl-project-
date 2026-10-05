import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const base = "http://localhost:3000";
const prisma = new PrismaClient();
const secret = process.env.RAZORPAY_KEY_SECRET || "dev-key-secret";
const stamp = Date.now();
const email = `fail${stamp}@example.com`;
const consent = `rsm_consent=${encodeURIComponent(JSON.stringify({ necessary: true, analytics: true, advertising: true }))}`;

function sign(orderId, paymentId) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

async function request(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { origin: base, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, json, setCookie: response.headers.getSetCookie?.() || [] };
}

const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
const original = { priceMinor: device.priceMinor, stock: device.stock, trackInventory: device.trackInventory };
await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 250000, trackInventory: true, stock: 3 } });
await prisma.siteSetting.upsert({ where: { key: "shippingEnabled" }, update: { value: "true" }, create: { key: "shippingEnabled", value: "true" } });
await prisma.siteSetting.upsert({ where: { key: "shippingFlatMinor" }, update: { value: "0" }, create: { key: "shippingFlatMinor", value: "0" } });

try {
  const otp = await request("/api/auth/otp", { method: "POST", cookie: consent, body: { email } });
  if (otp.status !== 200) throw new Error("otp failed");
  const log = await prisma.emailLog.findFirst({ where: { recipient: email, type: "otp" }, orderBy: { createdAt: "desc" } });
  const code = log.body.match(/letter-spacing:\.2em;">(\d{6})/)[1];
  const verified = await request("/api/auth/verify", { method: "POST", cookie: consent, body: { email, code } });
  const cookie = [`${consent}`, ...verified.setCookie.map((item) => item.split(";")[0])].join("; ");
  await request("/api/payments/create-order", {
    method: "POST",
    cookie,
    body: {
      idempotencyKey: `fail-${stamp}`,
      lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
      address: { name: "Fail Tester", email, phone: "9876543210", line1: "1 Test Street", city: "Mumbai", region: "MH", postcode: "400001", country: "India" },
    },
  });
  const order = await prisma.order.findFirst({ where: { email } });
  const razorpayOrderId = `order_fail_${stamp}`;
  const paymentId = `pay_fail_${stamp}`;
  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
  const paid = await request("/api/payments/verify", {
    method: "POST",
    cookie,
    body: { orderId: order.id, razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: sign(razorpayOrderId, paymentId) },
  });
  const purchase = await prisma.metaEvent.findUnique({ where: { eventId: `purchase_${order.id}` } });
  const fresh = await prisma.order.findUnique({ where: { id: order.id } });
  console.log(paid.status === 200 && fresh.paymentStatus === "PAID" ? "PASS order stays paid when Meta fails" : "FAIL order stays paid when Meta fails");
  console.log(purchase?.status === "FAILED" && purchase.eventId === `purchase_${order.id}` ? "PASS failed Meta event keeps the purchase id" : `FAIL meta status ${purchase?.status}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const retried = await prisma.metaEvent.findUnique({ where: { eventId: `purchase_${order.id}` } });
  const count = await prisma.metaEvent.count({ where: { eventId: `purchase_${order.id}` } });
  console.log(count === 1 && retried.attempts >= 2 && retried.eventId === purchase.eventId ? "PASS retry uses the same event id" : `FAIL retry count ${count} attempts ${retried?.attempts}`);
  console.log((await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus === "PAID" ? "PASS retry does not roll back payment" : "FAIL retry rolled back payment");
} finally {
  const users = await prisma.user.findMany({ where: { email } });
  const orders = await prisma.order.findMany({ where: { email } });
  await prisma.metaEvent.deleteMany({ where: { OR: [{ orderId: { in: orders.map((order) => order.id) } }, { userId: { in: users.map((user) => user.id) } }] } });
  await prisma.analyticsEvent.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } });
  await prisma.emailLog.deleteMany({ where: { recipient: email } });
  await prisma.order.deleteMany({ where: { email } });
  await prisma.session.deleteMany({ where: { userId: { in: users.map((user) => user.id) } } });
  await prisma.otpCode.deleteMany({ where: { email } });
  await prisma.user.deleteMany({ where: { email } });
  await prisma.product.update({ where: { id: device.id }, data: original });
  await prisma.siteSetting.deleteMany({ where: { key: { in: ["shippingFlatMinor", "shippingEnabled"] } } });
  await prisma.$disconnect();
}
