import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { authoritativeMetaEvent } from "@/lib/analytics/catalog-event";
import { paymentInfoEventId, paymentStartedEventId, purchaseEventId } from "@/lib/analytics/ids";
import { purchasePayload } from "@/lib/analytics/purchase";
import { metaBasketAmount, metaLineAmount, offerForCurrency, publishedPrices } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

test("pixel helpers stay on the USD catalog even if the market says INR", () => {
  assert.equal(publishedPrices.currency, "USD");
  assert.deepEqual(offerForCurrency("DEVICE", "INR"), { price: publishedPrices.device, currency: "USD" });
  assert.deepEqual(offerForCurrency("CARTRIDGE_TRIO", "INR"), { price: publishedPrices.cartridgeTrio, currency: "USD" });
  assert.deepEqual(offerForCurrency("REFILL", "INR"), { price: publishedPrices.refill, currency: "USD" });
  assert.deepEqual(offerForCurrency("BUNDLE", "INR"), { price: publishedPrices.bundle, currency: "USD" });
  assert.deepEqual(metaLineAmount(1, "INR"), { value: 1, currency: "USD" });
  assert.equal(metaBasketAmount([{ price: 1, quantity: 1 }], "INR").currency, "USD");
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
    assert.equal(view.currency, "USD");
    assert.equal(view.customData.currency, "USD");
    assert.equal(view.customData.value, publishedPrices.device);
    assert.notEqual(view.customData.value, 350);
    assert.deepEqual(view.contentIds, [device.id]);
    assert.notEqual(view.customData.value, 1);

    const cart = await authoritativeMetaEvent("AddToCart", {
      contentIds: [trio.slug],
      quantity: 2,
      contents: [{ id: trio.slug, quantity: 2, item_price: 5 } as never],
    });
    assert.ok(cart);
    assert.equal(cart.customData.currency, "USD");
    assert.equal(cart.customData.value, publishedPrices.cartridgeTrio * 2);
    assert.deepEqual(cart.customData.contents, [{ id: trio.id, quantity: 2, item_price: publishedPrices.cartridgeTrio }]);

    const refillCart = await authoritativeMetaEvent("AddToCart", {
      contentIds: [refill.id],
      quantity: 1,
      contents: [{ id: refill.id, quantity: 1, item_price: 0 } as never],
    });
    assert.equal(refillCart?.customData.value, publishedPrices.refill);
    assert.equal(refillCart?.customData.currency, "USD");

    const bundleView = await authoritativeMetaEvent("ViewContent", { contentIds: [bundle.slug] });
    assert.equal(bundleView?.customData.value, publishedPrices.bundle);
    assert.equal(bundleView?.customData.currency, "USD");

    const checkout = await authoritativeMetaEvent("InitiateCheckout", {
      contentIds: [device.id, trio.slug, refill.slug],
      contents: [
        { id: device.id, quantity: 1, item_price: 1 } as never,
        { id: trio.slug, quantity: 1, item_price: 5 } as never,
        { id: refill.slug, quantity: 1, item_price: 0 } as never,
      ],
    });
    assert.ok(checkout);
    assert.equal(checkout.customData.currency, "USD");
    const settings = await getSettings();
    const subtotalMinor = Math.round(publishedPrices.device * 100) + Math.round(publishedPrices.cartridgeTrio * 100) + Math.round(publishedPrices.refill * 100);
    const shippingKnown = settings.shippingEnabled && settings.shippingFlatMinor != null;
    const shippingMinor = !shippingKnown
      ? 0
      : settings.freeShippingThresholdMinor != null && subtotalMinor >= settings.freeShippingThresholdMinor
        ? 0
        : settings.shippingFlatMinor || 0;
    const taxMinor = settings.taxRateBps > 0 ? Math.round((subtotalMinor * settings.taxRateBps) / 10000) : 0;
    assert.equal(checkout.valueMinor, subtotalMinor + (shippingKnown ? shippingMinor : 0) + taxMinor);
    const contents = checkout.customData.contents as { id: string; item_price: number }[];
    assert.equal(contents.find((line) => line.id === device.id)?.item_price, publishedPrices.device);
    assert.equal(contents.find((line) => line.id === trio.id)?.item_price, publishedPrices.cartridgeTrio);
    assert.equal(contents.find((line) => line.id === refill.id)?.item_price, publishedPrices.refill);
    assert.equal(JSON.stringify(checkout.customData).includes("INR"), false);

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
    assert.notEqual(purchase.value, 350);
    assert.equal(purchase.eventId, `purchase_${device.id}`);
    assert.equal(await authoritativeMetaEvent("Purchase", { contentIds: [device.id] }), null);
    assert.equal(await authoritativeMetaEvent("AddPaymentInfo", { contentIds: [device.id] }), null);
    assert.equal(await authoritativeMetaEvent("PaymentStarted", { contentIds: [device.id] }), null);
  } finally {
    await prisma.$disconnect();
  }
});
