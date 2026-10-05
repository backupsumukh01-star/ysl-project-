import { createHmac } from "node:crypto";
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
  } else console.log("PASS", name);
}

function sign(orderId, paymentId) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

function consent(advertising, analytics = advertising) {
  return `rsm_consent=${encodeURIComponent(JSON.stringify({ necessary: true, analytics, advertising }))}`;
}

async function request(path, { method = "GET", body, cookie, raw } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      origin: base,
      ...(raw ? {} : { "content-type": "application/json" }),
      ...(cookie ? { cookie } : {}),
    },
    body: raw || (body ? JSON.stringify(body) : undefined),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: response.status, json, text, setCookie: response.headers.getSetCookie?.() || [] };
}

function cookieFrom(setCookie, extra = "") {
  return [extra, ...setCookie.map((item) => item.split(";")[0])].filter(Boolean).join("; ");
}

async function main() {
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  if (!device) throw new Error("Seed the database first.");
  const originalPrice = device.priceMinor;
  const originalStock = device.stock;
  const originalTrack = device.trackInventory;
  await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 250000, trackInventory: true, stock: 4 } });
  await prisma.siteSetting.upsert({ where: { key: "shippingEnabled" }, update: { value: "true" }, create: { key: "shippingEnabled", value: "true" } });
  await prisma.siteSetting.upsert({ where: { key: "shippingFlatMinor" }, update: { value: "0" }, create: { key: "shippingFlatMinor", value: "0" } });
  const stamp = Date.now();
  const email = `meta${stamp}@example.com`;
  const declineEmail = `decline${stamp}@example.com`;

  try {
    const catalog = await request("/api/meta/catalog");
    assert("catalog feed includes the real product id", catalog.status === 200 && catalog.text.includes(device.id) && catalog.text.includes("INR"));
    assert("catalog feed does not claim a live connection", catalog.text.includes("not connected"));

    const anonymous = `anon_${stamp}`;
    const blocked = await request("/api/analytics/events", {
      method: "POST",
      body: { event: "PageView", payload: { eventId: anonymous }, url: `${base}/?utm_source=meta&utm_campaign=spring` },
    });
    assert("analytics without consent is accepted but not stored", blocked.status === 204);
    assert("declined visitor creates no page view", (await prisma.analyticsEvent.count({ where: { eventId: anonymous } })) === 0);

    const allowed = `view_${stamp}`;
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: {
        event: "PageView",
        payload: { eventId: allowed },
        url: `${base}/shop?utm_source=meta&utm_medium=paid&utm_campaign=spring&fbclid=click123`,
      },
    });
    const pageView = await prisma.analyticsEvent.findFirst({ where: { eventId: allowed } });
    assert("consented page view is stored", pageView?.name === "PageView" && pageView.source === "meta" && pageView.campaign === "spring");
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: { event: "PageView", payload: { eventId: allowed }, url: `${base}/shop` },
    });
    assert("same page view event id is not stored twice", (await prisma.analyticsEvent.count({ where: { eventId: allowed } })) === 1);

    const searchId = `search_${stamp}`;
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: { event: "Search", payload: { eventId: searchId, searchString: "rouge" }, url: `${base}/shop?q=rouge` },
    });
    assert("search is stored", (await prisma.analyticsEvent.findFirst({ where: { eventId: searchId } }))?.name === "Search");

    const cartId = `cart_${stamp}`;
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: { event: "AddToCart", payload: { eventId: cartId, contentIds: [device.slug], currency: "INR" }, url: `${base}/product/rouge-sur-mesure` },
    });
    const cartEvent = await prisma.analyticsEvent.findFirst({ where: { eventId: cartId } });
    assert("add to cart uses the database product id", cartEvent?.contentIds === device.id);

    const checkoutId = `checkout_${stamp}`;
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: { event: "InitiateCheckout", payload: { eventId: checkoutId, contentIds: [device.id], numItems: 1, currency: "INR" }, url: `${base}/checkout` },
    });
    assert("initiate checkout is stored", (await prisma.analyticsEvent.findFirst({ where: { eventId: checkoutId } }))?.name === "InitiateCheckout");

    const otp = await request("/api/auth/otp", { method: "POST", cookie: consent(true), body: { email } });
    assert("registration otp accepted", otp.status === 200);
    const log = await prisma.emailLog.findFirst({ where: { recipient: email, type: "otp" }, orderBy: { createdAt: "desc" } });
    const code = log?.body?.match(/letter-spacing:\.2em;">(\d{6})/)?.[1];
    const verified = await request("/api/auth/verify", { method: "POST", cookie: consent(true), body: { email, code } });
    assert("new account returns created", verified.status === 200 && verified.json?.data?.created === true);
    const user = await prisma.user.findUnique({ where: { email } });
    const registration = await prisma.metaEvent.findUnique({ where: { eventId: `registration_${user.id}` } });
    assert("registration event uses a stable id", registration?.eventName === "CompleteRegistration" && registration.status === "SKIPPED");
    const loginAgain = await request("/api/auth/verify", { method: "POST", cookie: consent(true), body: { email, code: "000000" } });
    assert("a second login does not create another registration", loginAgain.status === 401);
    assert("registration event stays singular", (await prisma.metaEvent.count({ where: { eventId: `registration_${user.id}` } })) === 1);

    const session = cookieFrom(verified.setCookie, consent(true));
    const created = await request("/api/payments/create-order", {
      method: "POST",
      cookie: session,
      body: {
        idempotencyKey: `meta-${stamp}`,
        lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
        attribution: {
          firstTouchSource: "meta",
          firstTouchMedium: "paid",
          firstTouchCampaign: "spring",
          lastTouchSource: "meta",
          lastTouchMedium: "paid",
          lastTouchCampaign: "spring",
          fbclid: "click123",
          landingPage: "/?utm_source=meta",
          referrer: "https://instagram.com/",
        },
        address: {
          name: "Meta Tester",
          email,
          phone: "9876543210",
          line1: "1 Test Street",
          city: "Mumbai",
          region: "MH",
          postcode: "400001",
          country: "India",
        },
      },
    });
    assert("checkout stays unpaid when Razorpay is not configured", created.status === 503);
    const order = await prisma.order.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });
    assert("attribution is stored on the order", order.attributionJson.includes("spring") && order.marketingConsent === true);
    assert("payment info is not sent before a Razorpay order exists", (await prisma.metaEvent.count({ where: { eventId: `add_payment_info_${order.id}` } })) === 0);

    const razorpayOrderId = `order_meta_${stamp}`;
    const paymentId = `pay_meta_${stamp}`;
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
    const bad = await request("/api/payments/verify", {
      method: "POST",
      cookie: session,
      body: { orderId: order.id, razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: "bad" },
    });
    assert("failed verification does not fire purchase", bad.status === 400 && (await prisma.metaEvent.count({ where: { eventId: `purchase_${order.id}` } })) === 0);
    assert("failed verification does not mark the order paid", (await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus !== "PAID");

    const replay = await request("/api/payments/create-order", {
      method: "POST",
      cookie: session,
      body: {
        idempotencyKey: `meta-${stamp}`,
        lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
        address: {
          name: "Meta Tester",
          email,
          phone: "9876543210",
          line1: "1 Test Street",
          city: "Mumbai",
          region: "MH",
          postcode: "400001",
          country: "India",
        },
      },
    });
    assert("payment info starts only after a Razorpay order id exists", replay.status === 200 && replay.json?.data?.razorpayOrderId === razorpayOrderId);
    const paymentInfo = await prisma.metaEvent.findUnique({ where: { eventId: `add_payment_info_${order.id}` } });
    assert("payment info event id is stable and has no card data", paymentInfo?.eventName === "AddPaymentInfo" && !JSON.stringify(paymentInfo).includes("4242") && !paymentInfo.errorMessage.toLowerCase().includes("cvv"));

    const paid = await request("/api/payments/verify", {
      method: "POST",
      cookie: session,
      body: {
        orderId: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(razorpayOrderId, paymentId),
      },
    });
    const purchase = await prisma.metaEvent.findUnique({ where: { eventId: `purchase_${order.id}` } });
    assert("purchase uses purchase_<order id>", paid.json?.data?.purchase?.eventId === `purchase_${order.id}` && purchase?.eventId === `purchase_${order.id}`);
    assert("purchase is not marked sent without Meta credentials", purchase?.status === "SKIPPED" && purchase.errorMessage === "credentials not configured");
    assert("verified order is paid", (await prisma.order.findUnique({ where: { id: order.id } })).paymentStatus === "PAID");
    assert("purchase value matches the order total", (await prisma.analyticsEvent.findFirst({ where: { eventId: purchase.eventId } }))?.valueMinor === 250000);

    const duplicate = await request("/api/payments/verify", {
      method: "POST",
      cookie: session,
      body: {
        orderId: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(razorpayOrderId, paymentId),
      },
    });
    assert("duplicate verification does not return another purchase", duplicate.json?.data?.duplicate === true && duplicate.json?.data?.purchase == null);
    assert("duplicate verification keeps one purchase event", (await prisma.metaEvent.count({ where: { eventId: `purchase_${order.id}` } })) === 1);
    assert("inventory decrements once", (await prisma.product.findUnique({ where: { id: device.id } })).stock === 3);

    const raw = JSON.stringify({
      id: `evt_meta_${stamp}`,
      event: "payment.captured",
      payload: { payment: { entity: { id: paymentId, order_id: razorpayOrderId } } },
    });
    const signature = createHmac("sha256", webhookSecret).update(raw).digest("hex");
    await fetch(`${base}/api/webhooks/razorpay`, { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": signature }, body: raw });
    await fetch(`${base}/api/webhooks/razorpay`, { method: "POST", headers: { "content-type": "application/json", "x-razorpay-signature": signature }, body: raw });
    assert("duplicate webhook does not duplicate the purchase", (await prisma.metaEvent.count({ where: { eventId: `purchase_${order.id}` } })) === 1);
    assert("duplicate webhook does not decrement inventory again", (await prisma.product.findUnique({ where: { id: device.id } })).stock === 3);
    assert("confirmation email is logged once", (await prisma.emailLog.count({ where: { recipient: email, type: "order_confirmation" } })) === 1);

    const cancelled = `cancel_${stamp}`;
    await request("/api/analytics/events", {
      method: "POST",
      cookie: consent(true),
      body: { event: "PaymentCancelled", payload: { eventId: cancelled }, url: `${base}/checkout` },
    });
    assert("cancelled payment is internal only", (await prisma.analyticsEvent.findFirst({ where: { eventId: cancelled } }))?.name === "PaymentCancelled");
    assert("cancelled payment creates no purchase", (await prisma.metaEvent.count({ where: { eventName: "Purchase", eventId: cancelled } })) === 0);

    const declineOtp = await request("/api/auth/otp", { method: "POST", body: { email: declineEmail } });
    assert("decline account otp accepted", declineOtp.status === 200);
    const declineLog = await prisma.emailLog.findFirst({ where: { recipient: declineEmail, type: "otp" }, orderBy: { createdAt: "desc" } });
    const declineCode = declineLog?.body?.match(/letter-spacing:\.2em;">(\d{6})/)?.[1];
    const declineVerified = await request("/api/auth/verify", { method: "POST", cookie: consent(false), body: { email: declineEmail, code: declineCode } });
    const declineUser = await prisma.user.findUnique({ where: { email: declineEmail } });
    assert("declined registration is not sent", (await prisma.metaEvent.findUnique({ where: { eventId: `registration_${declineUser.id}` } }))?.status === "SKIPPED");
    const declineSession = cookieFrom(declineVerified.setCookie, consent(false));
    const declineOrder = await request("/api/payments/create-order", {
      method: "POST",
      cookie: declineSession,
      body: {
        idempotencyKey: `decline-${stamp}`,
        lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
        address: {
          name: "Decline Tester",
          email: declineEmail,
          phone: "9876543211",
          line1: "2 Test Street",
          city: "Mumbai",
          region: "MH",
          postcode: "400001",
          country: "India",
        },
      },
    });
    assert("declined checkout is still created", declineOrder.status === 503);
    const declined = await prisma.order.findFirst({ where: { email: declineEmail } });
    const declineRazorpay = `order_decline_${stamp}`;
    await prisma.order.update({ where: { id: declined.id }, data: { razorpayOrderId: declineRazorpay } });
    const declinePaid = await request("/api/payments/verify", {
      method: "POST",
      cookie: declineSession,
      body: {
        orderId: declined.id,
        razorpay_order_id: declineRazorpay,
        razorpay_payment_id: `pay_decline_${stamp}`,
        razorpay_signature: sign(declineRazorpay, `pay_decline_${stamp}`),
      },
    });
    const declinePurchase = await prisma.metaEvent.findUnique({ where: { eventId: `purchase_${declined.id}` } });
    assert("declined advertising still completes the order", declinePaid.status === 200 && (await prisma.order.findUnique({ where: { id: declined.id } })).paymentStatus === "PAID");
    assert("declined advertising does not send purchase", declinePurchase?.status === "SKIPPED" && declinePurchase.errorMessage.includes("consent"));

    const support = await request("/api/support", {
      method: "POST",
      cookie: consent(true),
      body: { name: "Meta Tester", email, subject: "Shade question", message: "My private note should stay here." },
    });
    const contact = await prisma.metaEvent.findUnique({ where: { eventId: `contact_${support.json?.data?.id}` } });
    assert("contact event is created after the ticket", contact?.eventName === "Contact");
    assert("contact event does not store the message", !JSON.stringify(contact).includes("private note"));

    const secretLeak = JSON.stringify(purchase) + JSON.stringify(paymentInfo) + JSON.stringify(contact);
    assert("meta log does not contain the access token", !secretLeak.includes("META_ACCESS_TOKEN") && !secretLeak.toLowerCase().includes("access_token"));
  } finally {
    await prisma.product.update({ where: { id: device.id }, data: { priceMinor: originalPrice, stock: originalStock, trackInventory: originalTrack } });
    await prisma.siteSetting.deleteMany({ where: { key: { in: ["shippingFlatMinor", "shippingEnabled"] } } });
    const users = await prisma.user.findMany({ where: { email: { in: [email, declineEmail] } } });
    const userIds = users.map((user) => user.id);
    const orders = await prisma.order.findMany({ where: { email: { in: [email, declineEmail] } } });
    const orderIds = orders.map((order) => order.id);
    await prisma.metaEvent.deleteMany({ where: { OR: [{ orderId: { in: orderIds } }, { userId: { in: userIds } }, { eventId: { contains: String(stamp) } }] } });
    await prisma.analyticsEvent.deleteMany({ where: { OR: [{ eventId: { contains: String(stamp) } }, { userId: { in: userIds } }] } });
    await prisma.emailLog.deleteMany({ where: { recipient: { in: [email, declineEmail] } } });
    await prisma.supportTicket.deleteMany({ where: { email: { in: [email, declineEmail] } } });
    await prisma.webhookEvent.deleteMany({ where: { eventId: `evt_meta_${stamp}` } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.otpCode.deleteMany({ where: { email: { in: [email, declineEmail] } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }

  if (failures.length) {
    console.error(`\n${failures.length} failed`);
    process.exit(1);
  }
  console.log("\nAll meta checks passed");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
