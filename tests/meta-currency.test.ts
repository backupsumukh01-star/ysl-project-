import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { authoritativeMetaEvent } from "@/lib/analytics/catalog-event";
import { paymentInfoEventId, paymentStartedEventId, purchaseEventId } from "@/lib/analytics/ids";
import { purchasePayload } from "@/lib/analytics/purchase";
import { metaBasketAmount, metaLineAmount, offerForCurrency, publishedMajor, publishedPrices, storeCurrency } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

test("pixel helpers use the rupee selling price even if the market says USD", () => {
  assert.equal(storeCurrency, "INR");
  assert.equal(publishedPrices.device, 101.5);
  assert.deepEqual(offerForCurrency("DEVICE", "USD"), { price: publishedMajor("DEVICE"), currency: "INR" });
  assert.deepEqual(offerForCurrency("CARTRIDGE_TRIO", "USD"), { price: 1999, currency: "INR" });
  assert.deepEqual(offerForCurrency("REFILL", "USD"), { price: 799, currency: "INR" });
  assert.deepEqual(offerForCurrency("BUNDLE", "USD"), { price: 9999, currency: "INR" });
  assert.notEqual(offerForCurrency("DEVICE", "USD").price, 35000);
  assert.deepEqual(metaLineAmount(9999, "USD"), { value: 9999, currency: "INR" });
  assert.equal(metaBasketAmount([{ price: 9999, quantity: 1 }], "USD").currency, "INR");
  assert.equal(metaBasketAmount([{ price: 9999, quantity: 1 }], "USD").value, 9999);
});

test("payment and purchase event ids stay stable", () => {
  assert.equal(purchaseEventId("order-1"), "purchase_order-1");
  assert.equal(paymentInfoEventId("order-1"), "add_payment_info_order-1");
  assert.equal(paymentStartedEventId("order-1"), "payment_started_order-1");
});

test("browser price and currency cannot set Meta server values", async () => {
  const prisma = new PrismaClient();
  const device = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
  const trio = await prisma.product.findUnique({ where: { slug: "cartridge-trio-red" } });
  const refill = await prisma.product.findUnique({ where: { slug: "cartridge-refill" } });
  const bundle = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure-bundle" } });
  assert.ok(device && trio && refill && bundle);
  try {
    const view = await authoritativeMetaEvent("ViewContent", {
      contentIds: [device.slug],
      contents: [{ id: device.slug, quantity: 1, item_price: 1 } as never],
      quantity: 1,
    });
    assert.ok(view);
    assert.equal(view.currency, "INR");
    assert.equal(view.customData.currency, "INR");
    assert.equal(view.customData.value, 9999);
    assert.notEqual(view.customData.value, 35000);
    assert.notEqual(view.customData.value, publishedPrices.device);
    assert.deepEqual(view.contentIds, [device.id]);
    assert.notEqual(view.customData.value, 1);

    const cart = await authoritativeMetaEvent("AddToCart", {
      contentIds: [trio.slug],
      quantity: 2,
      contents: [{ id: trio.slug, quantity: 2, item_price: 5 } as never],
    });
    assert.ok(cart);
    assert.equal(cart.customData.currency, "INR");
    assert.equal(cart.customData.value, 1999 * 2);
    assert.deepEqual(cart.customData.contents, [{ id: trio.id, quantity: 2, item_price: 1999 }]);

    const refillCart = await authoritativeMetaEvent("AddToCart", {
      contentIds: [refill.id],
      quantity: 1,
      contents: [{ id: refill.id, quantity: 1, item_price: 0 } as never],
    });
    assert.equal(refillCart?.customData.value, 799);
    assert.notEqual(refillCart?.customData.value, 2999);
    assert.equal(refillCart?.customData.currency, "INR");

    const bundleView = await authoritativeMetaEvent("ViewContent", { contentIds: [bundle.slug] });
    assert.equal(bundleView?.customData.value, 9999);
    assert.notEqual(bundleView?.customData.value, 35000);
    assert.equal(bundleView?.customData.currency, "INR");

    const checkout = await authoritativeMetaEvent("InitiateCheckout", {
      contentIds: [device.id, trio.slug, refill.slug],
      contents: [
        { id: device.id, quantity: 1, item_price: 1 } as never,
        { id: trio.slug, quantity: 1, item_price: 5 } as never,
        { id: refill.slug, quantity: 1, item_price: 0 } as never,
      ],
    });
    assert.ok(checkout);
    assert.equal(checkout.customData.currency, "INR");
    const settings = await getSettings();
    const subtotalMinor = 999900 + 199900 + 79900;
    const shippingKnown = settings.shippingEnabled && settings.shippingFlatMinor != null;
    const shippingMinor = !shippingKnown
      ? 0
      : settings.freeShippingThresholdMinor != null && subtotalMinor >= settings.freeShippingThresholdMinor
        ? 0
        : settings.shippingFlatMinor || 0;
    const taxMinor = settings.taxRateBps > 0 ? Math.round((subtotalMinor * settings.taxRateBps) / 10000) : 0;
    assert.equal(checkout.valueMinor, subtotalMinor + (shippingKnown ? shippingMinor : 0) + taxMinor);
    const contents = checkout.customData.contents as { id: string; item_price: number }[];
    assert.equal(contents.find((line) => line.id === device.id)?.item_price, 9999);
    assert.equal(contents.find((line) => line.id === trio.id)?.item_price, 1999);
    assert.equal(contents.find((line) => line.id === refill.id)?.item_price, 799);
    assert.equal(JSON.stringify(checkout.customData).includes("USD"), false);
    assert.equal(checkout.customData.value, (checkout.valueMinor || 0) / 100);

    const purchase = purchasePayload({
      id: device.id,
      number: "RSM-TEST",
      currency: "USD",
      totalMinor: 10150,
      email: "buyer@example.com",
      name: "Buyer",
      phone: "0000000000",
      addressJson: "{}",
      userId: null,
      marketingConsent: true,
      analyticsConsent: true,
      attributionJson: "{}",
      items: [{ productId: device.id, quantity: 2, unitMinor: 10150, name: "Rouge Sur Mesure" }],
    });
    assert.equal(purchase.currency, "USD");
    assert.equal(purchase.value, 101.5);
    assert.equal(purchase.eventId, `purchase_${device.id}`);
    const paid = purchasePayload({
      id: "new-inr-order",
      number: "RSM-INR",
      currency: "INR",
      totalMinor: 999900,
      email: "buyer@example.com",
      name: "Buyer",
      phone: "0000000000",
      addressJson: "{}",
      userId: null,
      marketingConsent: true,
      analyticsConsent: true,
      attributionJson: "{}",
      items: [{ productId: device.id, quantity: 1, unitMinor: 999900, name: "Rouge Sur Mesure" }],
    });
    assert.equal(paid.currency, "INR");
    assert.equal(paid.value, 9999);
    assert.notEqual(paid.value, 35000);
    assert.equal(paid.eventId, "purchase_new-inr-order");
    assert.equal(await authoritativeMetaEvent("Purchase", { contentIds: [device.id] }), null);
    assert.equal(await authoritativeMetaEvent("AddPaymentInfo", { contentIds: [device.id] }), null);
    assert.equal(await authoritativeMetaEvent("PaymentStarted", { contentIds: [device.id] }), null);
  } finally {
    await prisma.$disconnect();
  }
});
