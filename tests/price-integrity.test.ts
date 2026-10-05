import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { authoritativeMinor, catalogMajorForSlug, publishedPrices } from "@/lib/pricing";
import { lineSchema } from "@/lib/validators";
import { createCheckoutOrder, previewCheckout } from "@/lib/commerce";

const expected = [
  ["rouge-sur-mesure", "Rouge Sur Mesure", "DEVICE", 350],
  ["cartridge-trio-red", "Cartridge Trio — Red", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-pink", "Cartridge Trio — Pink", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-orange", "Cartridge Trio — Orange", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-nude", "Cartridge Trio — Nude", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-warm-red", "Cartridge Trio — Warm Red", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-warm-nude", "Cartridge Trio — Warm Nude", "CARTRIDGE_TRIO", 89],
  ["cartridge-trio-cool-nude", "Cartridge Trio — Cool Nude", "CARTRIDGE_TRIO", 89],
  ["cartridge-refill", "Cartridge refill", "REFILL", 31],
  ["rouge-sur-mesure-bundle", "Rouge Sur Mesure bundle", "BUNDLE", 350],
] as const;

test("catalog file is the only published price table", () => {
  assert.equal(publishedPrices.currency, "USD");
  assert.equal(publishedPrices.device, 350);
  assert.equal(publishedPrices.cartridgeTrio, 89);
  assert.equal(publishedPrices.refill, 31);
  assert.equal(publishedPrices.bundle, 350);
  assert.equal(new Set(expected.map((row) => catalogMajorForSlug(row[0]))).size, 3);
  for (const [slug, , , price] of expected) assert.equal(catalogMajorForSlug(slug), price);
});

test("a stored or browser amount cannot replace a catalog price", () => {
  assert.equal(authoritativeMinor("DEVICE", 100), 35000);
  assert.equal(authoritativeMinor("CARTRIDGE_TRIO", 500), 8900);
  assert.equal(authoritativeMinor("REFILL", 0), 3100);
  assert.equal(authoritativeMinor("BUNDLE", 1), 35000);
  assert.equal(350 * 1, 350);
  assert.equal(89 * 2, 178);
  assert.equal(31 * 2, 62);
});

test("checkout line schema does not accept a client price", () => {
  const parsed = lineSchema.parse({ productId: "rouge-sur-mesure", quantity: 1, price: 1 });
  assert.equal("price" in parsed, false);
  assert.equal(parsed.quantity, 1);
});

test("database catalog matches the published prices and orders are left untouched", async () => {
  const prisma = new PrismaClient();
  const beforeOrders = await prisma.order.findMany({ select: { id: true, totalMinor: true, items: { select: { unitMinor: true } } } });
  try {
    const products = await prisma.product.findMany({ select: { slug: true, name: true, type: true, priceMinor: true, active: true } });
    assert.equal(products.filter((item) => item.active).length, 10);
    for (const [slug, name, type, price] of expected) {
      const row = products.find((item) => item.slug === slug);
      assert.ok(row, slug);
      assert.equal(row.name, name);
      assert.equal(row.type, type);
      assert.equal(row.active, true);
      assert.equal(row.priceMinor, price * 100);
    }
    const inactive = products.find((item) => item.slug === "accessory-to-be-confirmed");
    assert.equal(inactive?.active, false);
    assert.equal(inactive?.priceMinor, null);
  } finally {
    const afterOrders = await prisma.order.findMany({ select: { id: true, totalMinor: true, items: { select: { unitMinor: true } } } });
    assert.deepEqual(afterOrders, beforeOrders);
    await prisma.$disconnect();
  }
});

test("server quote ignores a drifted database price and a tampered client amount", async () => {
  const prisma = new PrismaClient();
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  const trio = await prisma.product.findUnique({ where: { slug: "cartridge-trio-red" } });
  const refill = await prisma.product.findUnique({ where: { slug: "cartridge-refill" }, include: { variants: true } });
  assert.ok(device && trio && refill);
  const variant = refill.variants[0];
  try {
    await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 100 } });
    await prisma.product.update({ where: { id: trio.id }, data: { priceMinor: 500 } });
    await prisma.product.update({ where: { id: refill.id }, data: { priceMinor: 0 } });
    if (variant) await prisma.productVariant.update({ where: { id: variant.id }, data: { priceMinor: 0 } });
    const quoted = await previewCheckout({
      lines: [
        { productId: device.id, quantity: 1, price: 1, selection: "Red · Nude · Pink" } as never,
        { productId: trio.slug, quantity: 2, price: 5 } as never,
        { productId: refill.slug, variantId: variant?.id, quantity: 2, price: 0 } as never,
      ],
    });
    assert.equal(quoted.ok, true);
    if (!quoted.ok) return;
    const byName = new Map(quoted.preview.lines.map((line) => [line.name, line]));
    assert.equal(byName.get("Rouge Sur Mesure")?.unitMinor, 35000);
    assert.equal(byName.get("Rouge Sur Mesure")?.variantName, "Red · Nude · Pink");
    const missing = await previewCheckout({ lines: [{ productId: device.id, quantity: 1 }] });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.code, "SELECTION_REQUIRED");
    assert.equal(byName.get("Cartridge Trio — Red")?.unitMinor, 8900);
    assert.equal(byName.get("Cartridge Trio — Red")?.quantity, 2);
    assert.equal(byName.get("Cartridge refill")?.unitMinor, 3100);
    assert.equal(quoted.preview.subtotalMinor, 35000 + 8900 * 2 + 3100 * 2);
  } finally {
    await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 35000 } });
    await prisma.product.update({ where: { id: trio.id }, data: { priceMinor: 8900 } });
    await prisma.product.update({ where: { id: refill.id }, data: { priceMinor: 3100 } });
    if (variant) await prisma.productVariant.update({ where: { id: variant.id }, data: { priceMinor: null } });
    await prisma.$disconnect();
  }
});

test("a repeated checkout key does not create a second order or rewrite the recorded price", async () => {
  const prisma = new PrismaClient();
  const key = `price-integrity-${Date.now()}`;
  const created = await prisma.order.create({
    data: {
      number: `T${Date.now()}`,
      email: "price-integrity@example.com",
      name: "Price integrity",
      currency: "USD",
      subtotalMinor: 12345,
      totalMinor: 12345,
      idempotencyKey: key,
      items: { create: [{ productId: "historical", name: "Historical line", unitMinor: 12345, quantity: 1 }] },
    },
    include: { items: true },
  });
  try {
    const first = await createCheckoutOrder({
      lines: [{ productId: "rouge-sur-mesure", quantity: 1 }],
      address: {
        name: "Price integrity",
        email: "price-integrity@example.com",
        phone: "0000000000",
        line1: "1 Test",
        city: "Test",
        region: "Test",
        postcode: "00000",
        country: "United States",
      },
      idempotencyKey: key,
    });
    const second = await createCheckoutOrder({
      lines: [{ productId: "rouge-sur-mesure", quantity: 9 }],
      address: {
        name: "Changed",
        email: "other@example.com",
        phone: "1111111111",
        line1: "2 Test",
        city: "Other",
        region: "Other",
        postcode: "11111",
        country: "United States",
      },
      idempotencyKey: key,
    });
    assert.equal(first.ok, second.ok);
    const rows = await prisma.order.findMany({ where: { idempotencyKey: key }, include: { items: true } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.items[0]?.unitMinor, 12345);
    assert.equal(rows[0]?.totalMinor, 12345);
    assert.equal(rows[0]?.id, created.id);
  } finally {
    await prisma.order.delete({ where: { id: created.id } });
    await prisma.$disconnect();
  }
});
