import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { authoritativeMinor, catalogFeedAmounts, catalogMajorForSlug, publishedCompareMajor, publishedDiscountPercent, publishedPrices } from "@/lib/pricing";
import { lineSchema } from "@/lib/validators";
import { createCheckoutOrder, previewCheckout } from "@/lib/commerce";

const expected = [
  ["rouge-sur-mesure", "Rouge Sur Mesure", "DEVICE", 101.5],
  ["cartridge-trio-red", "Cartridge Trio — Red", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-pink", "Cartridge Trio — Pink", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-orange", "Cartridge Trio — Orange", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-nude", "Cartridge Trio — Nude", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-warm-red", "Cartridge Trio — Warm Red", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-warm-nude", "Cartridge Trio — Warm Nude", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-trio-cool-nude", "Cartridge Trio — Cool Nude", "CARTRIDGE_TRIO", 25.81],
  ["cartridge-refill", "Cartridge refill", "REFILL", 103.72],
  ["rouge-sur-mesure-bundle", "Rouge Sur Mesure bundle", "BUNDLE", 101.5],
] as const;

test("catalog file is the only published price table", () => {
  assert.equal(publishedPrices.currency, "USD");
  assert.equal(publishedPrices.device, 101.5);
  assert.equal(publishedPrices.cartridgeTrio, 25.81);
  assert.equal(publishedPrices.refill, 103.72);
  assert.equal(publishedPrices.bundle, 101.5);
  assert.equal(new Set(expected.map((row) => catalogMajorForSlug(row[0]))).size, 3);
  for (const [slug, , , price] of expected) assert.equal(catalogMajorForSlug(slug), price);
});

test("reference price stays separate from the 71 percent selling price", () => {
  assert.equal(Math.round(350 * 29) / 100, 101.5);
  assert.equal(publishedPrices.deviceCompareAt, 350);
  assert.equal(publishedPrices.device, 101.5);
  assert.equal(publishedDiscountPercent("DEVICE"), 71);
  assert.equal(authoritativeMinor("DEVICE", 35000), 10150);
  assert.deepEqual(catalogFeedAmounts("DEVICE"), { currency: "USD", regularMinor: 35000, saleMinor: 10150 });

  assert.equal(Math.round(89 * 29) / 100, 25.81);
  assert.equal(publishedPrices.cartridgeTrioCompareAt, 89);
  assert.equal(publishedPrices.cartridgeTrio, 25.81);
  assert.equal(publishedDiscountPercent("CARTRIDGE_TRIO"), 71);
  assert.deepEqual(catalogFeedAmounts("CARTRIDGE_TRIO"), { currency: "USD", regularMinor: 8900, saleMinor: 2581 });

  assert.equal(publishedPrices.bundleCompareAt, 350);
  assert.equal(publishedPrices.bundle, 101.5);
  assert.equal(publishedDiscountPercent("BUNDLE"), 71);
  assert.deepEqual(catalogFeedAmounts("BUNDLE"), { currency: "USD", regularMinor: 35000, saleMinor: 10150 });

  assert.equal(publishedPrices.refill, 103.72);
  assert.equal(publishedCompareMajor("REFILL"), null);
  assert.equal(publishedDiscountPercent("REFILL"), null);
  assert.deepEqual(catalogFeedAmounts("REFILL"), { currency: "USD", regularMinor: 10372, saleMinor: null });
  assert.notEqual(publishedPrices.refill, 8.99);
});

test("a stored or browser amount cannot replace a catalog price", () => {
  assert.equal(authoritativeMinor("DEVICE", 100), 10150);
  assert.equal(authoritativeMinor("CARTRIDGE_TRIO", 500), 2581);
  assert.equal(authoritativeMinor("REFILL", 0), 10372);
  assert.equal(authoritativeMinor("BUNDLE", 1), 10150);
  assert.equal(101.5 * 1, 101.5);
  assert.equal(25.81 * 2, 51.62);
  assert.equal(103.72 * 2, 207.44);
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
      assert.equal(row.priceMinor, Math.round(price * 100));
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
    assert.equal(byName.get("Rouge Sur Mesure")?.unitMinor, 10150);
    assert.equal(byName.get("Rouge Sur Mesure")?.variantName, "Red · Nude · Pink");
    const missing = await previewCheckout({ lines: [{ productId: device.id, quantity: 1 }] });
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.code, "SELECTION_REQUIRED");
    assert.equal(byName.get("Cartridge Trio — Red")?.unitMinor, 2581);
    assert.equal(byName.get("Cartridge Trio — Red")?.quantity, 2);
    assert.equal(byName.get("Cartridge refill")?.unitMinor, 10372);
    assert.equal(quoted.preview.subtotalMinor, 10150 + 2581 * 2 + 10372 * 2);
  } finally {
    await prisma.product.update({ where: { id: device.id }, data: { priceMinor: 10150 } });
    await prisma.product.update({ where: { id: trio.id }, data: { priceMinor: 2581 } });
    await prisma.product.update({ where: { id: refill.id }, data: { priceMinor: 10372 } });
    if (variant) await prisma.productVariant.update({ where: { id: variant.id }, data: { priceMinor: null } });
    await prisma.$disconnect();
  }
});

test("an India address still charges the USD catalog, not a rupee price", async () => {
  const prisma = new PrismaClient();
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  const trio = await prisma.product.findUnique({ where: { slug: "cartridge-trio-pink" } });
  const refill = await prisma.product.findUnique({ where: { slug: "cartridge-refill" }, include: { variants: true } });
  assert.ok(device && trio && refill);
  try {
    const quoted = await previewCheckout({
      country: "IN",
      lines: [
        { productId: device.id, quantity: 1, price: 1, selection: "Red · Nude · Pink" } as never,
        { productId: trio.slug, quantity: 1, price: 5 } as never,
        { productId: refill.slug, variantId: refill.variants[0]?.id, quantity: 1, price: 0 } as never,
      ],
    });
    assert.equal(quoted.ok, true);
    if (!quoted.ok) return;
    assert.equal(quoted.preview.currency, "USD");
    const byName = new Map(quoted.preview.lines.map((line) => [line.name, line]));
    assert.equal(byName.get("Rouge Sur Mesure")?.unitMinor, 10150);
    assert.equal(byName.get("Cartridge Trio — Pink")?.unitMinor, 2581);
    assert.equal(byName.get("Cartridge refill")?.unitMinor, 10372);
    assert.equal(quoted.preview.subtotalMinor, 10150 + 2581 + 10372);
  } finally {
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
