import { PrismaClient } from "@prisma/client";

const base = process.env.SITE || "http://localhost:3000";
const prisma = new PrismaClient();
const failures = [];
const stamp = Date.now();
const email = `ship${stamp}@example.com`;

function assert(name, condition) {
  if (!condition) {
    failures.push(name);
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
}

async function request(path, body) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, json };
}

function address(extra = {}) {
  return {
    name: "Test Customer",
    email,
    phone: "5551234567",
    line1: "1 Example Street",
    city: "Paris",
    region: "IDF",
    postcode: "75001",
    country: "France",
    ...extra,
  };
}

async function main() {
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  const trio = await prisma.product.findUnique({ where: { slug: "cartridge-trio-red" } });
  if (!device || !trio) throw new Error("Seed the database first.");
  const before = await prisma.order.count({ where: { email } });
  const previous = await prisma.siteSetting.findMany({
    where: { key: { in: ["shippingEnabled", "shippingFlatMinor", "freeShippingThresholdMinor", "shippingEstimate"] } },
  });
  await prisma.siteSetting.deleteMany({
    where: { key: { in: ["shippingEnabled", "shippingFlatMinor", "freeShippingThresholdMinor", "shippingEstimate"] } },
  });

  try {
    const empty = await request("/api/payments/create-order", {
      idempotencyKey: `empty-${stamp}`,
      lines: [],
      address: address(),
    });
    assert("empty cart is rejected", empty.status === 400 && empty.json?.error?.code === "VALIDATION");

    const blocked = await request("/api/checkout/quote", {
      lines: [{ productId: device.id, quantity: 1, price: 1, selection: "Red · Nude · Pink" }],
    });
    assert("unconfigured shipping does not quote a free rate", blocked.json?.data?.shippingConfigured === false && blocked.json?.data?.shipping == null);
    assert("tax stays unconfigured at zero", blocked.json?.data?.taxConfigured === false && blocked.json?.data?.tax === 0);
    assert("browser price is not used in the quote", blocked.json?.data?.subtotal === device.priceMinor / 100);

    const blockedOrder = await request("/api/payments/create-order", {
      idempotencyKey: `blocked-${stamp}`,
      lines: [{ productId: device.id, quantity: 1, price: 1, selection: "Red · Nude · Pink" }],
      address: address(),
    });
    assert("unconfigured shipping does not create an order", blockedOrder.status === 400 && blockedOrder.json?.error?.code === "SHIPPING_UNAVAILABLE");
    assert("no order was stored while shipping is unset", (await prisma.order.count({ where: { email } })) === before);

    const invalid = await request("/api/payments/create-order", {
      idempotencyKey: `invalid-${stamp}`,
      lines: [{ productId: device.id, quantity: 1, selection: "Red · Nude · Pink" }],
      address: address({ email: "not-an-email", phone: "1" }),
    });
    assert("invalid customer details are rejected", invalid.status === 400);

    await prisma.siteSetting.create({ data: { key: "shippingEnabled", value: "true" } });
    await prisma.siteSetting.create({ data: { key: "shippingFlatMinor", value: "1500" } });
    await prisma.siteSetting.create({ data: { key: "shippingEstimate", value: "Estimate is not published." } });

    const quoted = await request("/api/checkout/quote", {
      lines: [
        { productId: device.id, quantity: 2, price: 1, selection: "Red · Nude · Pink" },
        { productId: trio.id, quantity: 1, price: 1 },
      ],
    });
    const expectedSubtotal = (device.priceMinor * 2 + trio.priceMinor) / 100;
    assert("multiple products and quantity use catalog prices", quoted.json?.data?.subtotal === expectedSubtotal);
    assert("configured shipping is a real amount", quoted.json?.data?.shipping === 15);
    assert("total adds subtotal, shipping, and zero tax", quoted.json?.data?.total === expectedSubtotal + 15);

    const key = `order-${stamp}`;
    const body = {
      idempotencyKey: key,
      lines: [
        { productId: device.id, quantity: 2, price: 1, selection: "Red · Nude · Pink" },
        { productId: trio.id, quantity: 1, price: 1 },
      ],
      address: address(),
    };
    const [first, second] = await Promise.all([request("/api/payments/create-order", body), request("/api/payments/create-order", body)]);
    const again = await request("/api/payments/create-order", body);
    const orders = await prisma.order.findMany({ where: { email }, include: { items: true, payments: true } });
    assert("double submit creates one order", orders.length === 1);
    assert("refresh with the same key does not create another order", again.status === 503 && orders.length === 1);
    assert("one of the responses reports payment unavailable", [first, second, again].every((item) => item.json?.error?.code === "PAYMENT_NOT_CONFIGURED" || item.json?.success === true) && [first, second, again].some((item) => item.json?.error?.code === "PAYMENT_NOT_CONFIGURED"));
    const order = orders[0];
    assert("order is pending payment", order.status === "PENDING_PAYMENT" && order.paymentStatus === "PENDING");
    assert("order stores the customer and address", order.email === email && order.phone === "5551234567" && order.addressJson.includes("1 Example Street"));
    assert("order stores both products and the server total", order.items.length === 2 && order.totalMinor === device.priceMinor * 2 + trio.priceMinor + 1500 && order.taxMinor === 0 && order.shippingMinor === 1500);
    assert("device line records the chosen families", order.items.some((item) => item.variantName === "Red · Nude · Pink"));
    assert("payment row is not paid", order.payments.every((payment) => payment.status === "PENDING"));
    assert("responses do not include a secret", !JSON.stringify([first, second, again]).includes("KEY_SECRET"));
  } finally {
    await prisma.order.deleteMany({ where: { email } });
    await prisma.siteSetting.deleteMany({
      where: { key: { in: ["shippingEnabled", "shippingFlatMinor", "freeShippingThresholdMinor", "shippingEstimate"] } },
    });
    if (previous.length) {
      await prisma.siteSetting.createMany({ data: previous.map((row) => ({ key: row.key, value: row.value })) });
    }
    await prisma.$disconnect();
  }

  if (failures.length) {
    console.error(`\n${failures.length} failed`);
    process.exit(1);
  }
  console.log("\nshipping checkout checks passed");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
