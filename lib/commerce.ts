import { randomUUID } from "crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { paymentWasCaptured } from "@/lib/order-paid";
import { orderNumber } from "@/lib/crypto";
import { logError, logInfo } from "@/lib/logger";
import { getSettings, type StoreSettings } from "@/lib/settings";
import { receiptFromOrder } from "@/lib/email/order-notice";
import { sendEmail, sendOwnerEmail } from "@/lib/email/service";
import { createRazorpayOrder, createRazorpayRefund } from "@/lib/payments/razorpay";
import { purchasePayload, recordPaymentOutcome, sendVerifiedPurchase } from "@/lib/analytics/purchase";
import { reserveInventory, releaseInventory } from "@/lib/inventory";
import { authoritativeMinor, storeCurrency } from "@/lib/pricing";
import { fromMinor } from "@/lib/fx";
import { deviceFamilySelection } from "@/lib/trio-images";

export type LineInput = { productId: string; variantId?: string; quantity: number; selection?: string };

export type AddressInput = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
};

type QuoteLine = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  variantName: string;
  unitMinor: number;
  quantity: number;
  image: string;
  trackInventory: boolean;
  allowBackorder: boolean;
  stock: number;
  type: string;
};

export type Quote = {
  currency: string;
  lines: QuoteLine[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  couponCode: string;
  couponId: string;
  shippingMessage: string;
  shippingEstimate: string;
  taxConfigured: boolean;
};

export type CheckoutPreview = {
  currency: string;
  lines: { productId: string; variantId: string; name: string; variantName: string; quantity: number; unitMinor: number }[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number | null;
  taxMinor: number;
  totalMinor: number | null;
  shippingConfigured: boolean;
  taxConfigured: boolean;
  shippingEstimate: string;
};

type Fail = { ok: false; code: string; message: string };
type Ok<T> = { ok: true } & T;

function clampQty(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(10, Math.max(1, Math.floor(value)));
}

function resolveShipping(settings: StoreSettings, subtotalMinor: number): { ok: true; shippingMinor: number } | Fail {
  if (!settings.shippingEnabled || settings.shippingFlatMinor == null) {
    return { ok: false, code: "SHIPPING_UNAVAILABLE", message: "A shipping price has not been published, so checkout stays closed." };
  }
  const threshold = settings.freeShippingThresholdMinor;
  const shippingMinor = threshold != null && subtotalMinor >= threshold ? 0 : settings.shippingFlatMinor;
  return { ok: true, shippingMinor };
}

async function priceCart(input: { lines: LineInput[]; email?: string; couponCode?: string }): Promise<
  | Fail
  | {
      ok: true;
      settings: StoreSettings;
      lines: QuoteLine[];
      subtotalMinor: number;
      discountMinor: number;
      couponCode: string;
      couponId: string;
      taxable: number;
      taxMinor: number;
    }
> {
  const prisma = db();
  if (!prisma) return { ok: false, code: "DATABASE_UNAVAILABLE", message: "The catalog is not available yet." };
  if (!input.lines.length) return { ok: false, code: "EMPTY_CART", message: "Your bag is empty." };
  const settings = await getSettings();
  const ids = [...new Set(input.lines.map((line) => line.productId))];
  const products = await prisma.product.findMany({
    where: { active: true, OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
    include: { images: { where: { active: true }, orderBy: { sortOrder: "asc" } }, variants: true },
  });
  const byId = new Map<string, (typeof products)[number]>();
  for (const product of products) {
    byId.set(product.id, product);
    byId.set(product.slug, product);
  }
  const lines: QuoteLine[] = [];
  for (const line of input.lines) {
    const product = byId.get(line.productId);
    if (!product) return { ok: false, code: "PRODUCT_UNAVAILABLE", message: "A product in your bag is no longer available." };
    const quantity = clampQty(line.quantity);
    if (!quantity) return { ok: false, code: "INVALID_QUANTITY", message: "Check the quantity in your bag." };
    const variant = line.variantId ? product.variants.find((item) => item.id === line.variantId && item.active) : undefined;
    if (line.variantId && !variant) return { ok: false, code: "VARIANT_UNAVAILABLE", message: "That option is not available." };
    const needsOption = (product.type === "BUNDLE" || product.type === "REFILL") && product.variants.some((item) => item.active);
    if (needsOption && !variant) {
      return { ok: false, code: "SELECTION_REQUIRED", message: "Choose an option for each item in your bag." };
    }
    let variantName = variant?.name || "";
    if (product.type === "DEVICE") {
      const selection = deviceFamilySelection(line.selection);
      if (!selection) {
        return { ok: false, code: "SELECTION_REQUIRED", message: "Choose 3 cartridge families for the device." };
      }
      variantName = selection;
    }
    const unitMinor = authoritativeMinor(product.type, product.priceMinor);
    if (unitMinor == null) {
      return { ok: false, code: "PRICE_UNCONFIRMED", message: "A price has not been confirmed for an item in your bag." };
    }
    const stock = variant ? variant.stock - variant.reserved : product.stock - product.reserved;
    if (product.trackInventory && !product.allowBackorder && stock < quantity) {
      return { ok: false, code: "OUT_OF_STOCK", message: `${product.name} does not have enough stock.` };
    }
    const image = product.images.find((item) => item.isPrimary)?.src || product.images[0]?.src || "";
    lines.push({
      productId: product.id,
      variantId: variant?.id || "",
      name: product.name,
      sku: variant?.sku || product.sku,
      variantName,
      unitMinor,
      quantity,
      image,
      trackInventory: product.trackInventory,
      allowBackorder: product.allowBackorder,
      stock,
      type: product.type,
    });
  }
  const subtotalMinor = lines.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0);
  const coupon = await applyCoupon(prisma, input.couponCode || "", subtotalMinor, input.email || "", lines.map((line) => line.productId));
  if (!coupon.ok) return coupon;
  const taxable = Math.max(0, subtotalMinor - coupon.discountMinor);
  const taxMinor = Math.round((taxable * settings.taxRateBps) / 10000);
  return {
    ok: true as const,
    settings,
    lines,
    subtotalMinor,
    discountMinor: coupon.discountMinor,
    couponCode: coupon.code,
    couponId: coupon.couponId,
    taxable,
    taxMinor,
  };
}

function presentInStoreCurrency<T extends { unitMinor: number; quantity: number }>(
  lines: T[],
  amounts: { discountMinor: number; shippingMinor: number | null; taxMinor: number },
) {
  const subtotalMinor = lines.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0);
  const discountMinor = Math.min(subtotalMinor, amounts.discountMinor);
  const shippingMinor = amounts.shippingMinor;
  const taxMinor = amounts.taxMinor;
  const totalMinor = shippingMinor == null ? null : Math.max(0, subtotalMinor - discountMinor) + shippingMinor + taxMinor;
  return { currency: storeCurrency, lines, subtotalMinor, discountMinor, shippingMinor, taxMinor, totalMinor };
}

export async function previewCheckout(input: { lines: LineInput[]; email?: string; couponCode?: string; country?: string }): Promise<Ok<{ preview: CheckoutPreview }> | Fail> {
  const priced = await priceCart(input);
  if (!priced.ok) return priced;
  const shipping = resolveShipping(priced.settings, priced.subtotalMinor);
  const shippingMinor = shipping.ok ? shipping.shippingMinor : null;
  const presented = presentInStoreCurrency(priced.lines, {
    discountMinor: priced.discountMinor,
    shippingMinor,
    taxMinor: priced.taxMinor,
  });
  return {
    ok: true,
    preview: {
      currency: presented.currency,
      lines: presented.lines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        name: line.name,
        variantName: line.variantName,
        quantity: line.quantity,
        unitMinor: line.unitMinor,
      })),
      subtotalMinor: presented.subtotalMinor,
      discountMinor: presented.discountMinor,
      shippingMinor: presented.shippingMinor,
      taxMinor: presented.taxMinor,
      totalMinor: presented.totalMinor,
      shippingConfigured: shipping.ok,
      taxConfigured: priced.settings.taxRateBps > 0,
      shippingEstimate: priced.settings.shippingEstimate,
    },
  };
}

export async function quoteCart(input: { lines: LineInput[]; email?: string; couponCode?: string; country?: string }): Promise<Ok<{ quote: Quote }> | Fail> {
  const priced = await priceCart(input);
  if (!priced.ok) return priced;
  const shipping = resolveShipping(priced.settings, priced.subtotalMinor);
  if (!shipping.ok) return shipping;
  const usdTotal = priced.taxable + shipping.shippingMinor + priced.taxMinor;
  if (usdTotal < 100) {
    return { ok: false, code: "AMOUNT_TOO_SMALL", message: "The payable amount is below the payment minimum." };
  }
  const presented = presentInStoreCurrency(priced.lines, {
    discountMinor: priced.discountMinor,
    shippingMinor: shipping.shippingMinor,
    taxMinor: priced.taxMinor,
  });
  return {
    ok: true,
    quote: {
      currency: presented.currency,
      lines: presented.lines,
      subtotalMinor: presented.subtotalMinor,
      discountMinor: presented.discountMinor,
      shippingMinor: presented.shippingMinor ?? 0,
      taxMinor: presented.taxMinor,
      totalMinor: presented.totalMinor ?? 0,
      couponCode: priced.couponCode,
      couponId: priced.couponId,
      shippingMessage: priced.settings.shippingMessage,
      shippingEstimate: priced.settings.shippingEstimate,
      taxConfigured: priced.settings.taxRateBps > 0,
    },
  };
}

async function applyCoupon(
  prisma: PrismaClient,
  rawCode: string,
  subtotalMinor: number,
  email: string,
  productIds: string[],
): Promise<Ok<{ discountMinor: number; code: string; couponId: string }> | Fail> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: true, discountMinor: 0, code: "", couponId: "" };
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return { ok: false, code: "COUPON_INVALID", message: "That code is not active." };
  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) return { ok: false, code: "COUPON_INVALID", message: "That code is not active yet." };
  if (coupon.endsAt && coupon.endsAt.getTime() < now) return { ok: false, code: "COUPON_INVALID", message: "That code has expired." };
  if (subtotalMinor < coupon.minSubtotal) return { ok: false, code: "COUPON_MINIMUM", message: "The order does not meet the code minimum." };
  if (coupon.usageLimit != null && coupon.used >= coupon.usageLimit) {
    return { ok: false, code: "COUPON_LIMIT", message: "That code has reached its usage limit." };
  }
  if (email) {
    const uses = await prisma.couponUse.count({ where: { couponId: coupon.id, email } });
    if (uses >= coupon.perUserLimit) return { ok: false, code: "COUPON_LIMIT", message: "That code has already been used." };
  }
  if (coupon.productIds) {
    const allowed = coupon.productIds.split(",").filter(Boolean);
    if (allowed.length && !productIds.some((id) => allowed.includes(id))) {
      return { ok: false, code: "COUPON_INVALID", message: "That code does not apply to this bag." };
    }
  }
  let discount = coupon.type === "PERCENTAGE" ? Math.floor((subtotalMinor * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotalMinor));
  return { ok: true, discountMinor: discount, code: coupon.code, couponId: coupon.id };
}

async function rememberCustomerDetails(userId: string, address: AddressInput) {
  const prisma = db();
  if (!prisma) return;
  const line1 = [address.line1.trim(), address.line2?.trim() || ""].filter(Boolean).join("\n").slice(0, 200);
  try {
    const existing = await prisma.address.findMany({ where: { userId } });
    const match = existing.find(
      (row) => row.line1 === line1 && row.city === address.city && row.postcode === address.postcode && row.country === address.country,
    );
    await prisma.$transaction(async (tx) => {
      if (address.name || address.phone) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(address.name ? { name: address.name.slice(0, 120) } : {}),
            ...(address.phone ? { phone: address.phone.slice(0, 30) } : {}),
          },
        });
      }
      if (!line1 || !address.city || !address.region || !address.postcode || !address.country) return;
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
      const fields = {
        name: address.name.slice(0, 120),
        phone: (address.phone || "").slice(0, 30),
        region: address.region.slice(0, 80),
        isDefault: true,
      };
      if (match) {
        await tx.address.update({ where: { id: match.id }, data: fields });
      } else {
        await tx.address.create({
          data: {
            ...fields,
            userId,
            line1,
            city: address.city.slice(0, 80),
            postcode: address.postcode.slice(0, 20),
            country: address.country.slice(0, 80),
          },
        });
      }
    });
  } catch {
    logError("address_saved", { status: "failed" });
  }
}

export async function createCheckoutOrder(input: {
  lines: LineInput[];
  address: AddressInput;
  couponCode?: string;
  userId?: string | null;
  idempotencyKey: string;
  marketingConsent?: boolean;
  analyticsConsent?: boolean;
  attribution?: Record<string, string | undefined>;
}) {
  const prisma = db();
  if (!prisma) return { ok: false as const, code: "DATABASE_UNAVAILABLE", message: "Orders are not available yet." };
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: { items: true, payments: true } });
  if (existing && existing.paymentStatus === "PENDING" && existing.status === "PENDING_PAYMENT") {
    if (input.userId) await rememberCustomerDetails(input.userId, input.address);
    return attachRazorpay(existing);
  }
  const idempotencyKey = existing ? `${input.idempotencyKey}:${randomUUID()}` : input.idempotencyKey;
  const quoted = await quoteCart({ lines: input.lines, email: input.address.email, couponCode: input.couponCode, country: input.address.country });
  if (!quoted.ok) return quoted;
  const quote = quoted.quote;
  let createdId = "";
  try {
    const created = await prisma.order.create({
      data: {
        number: orderNumber(),
        userId: input.userId || null,
        email: input.address.email,
        name: input.address.name,
        phone: input.address.phone,
        currency: quote.currency,
        subtotalMinor: quote.subtotalMinor,
        discountMinor: quote.discountMinor,
        shippingMinor: quote.shippingMinor,
        taxMinor: quote.taxMinor,
        totalMinor: quote.totalMinor,
        couponCode: quote.couponCode,
        addressJson: JSON.stringify(input.address),
        idempotencyKey,
        marketingConsent: input.marketingConsent === true,
        analyticsConsent: input.analyticsConsent === true,
        landingPage: (input.attribution?.landingPage || "").slice(0, 300),
        referrer: (input.attribution?.referrer || "").slice(0, 300),
        attributionJson: JSON.stringify({
          firstTouchSource: (input.attribution?.firstTouchSource || "").slice(0, 120),
          firstTouchMedium: (input.attribution?.firstTouchMedium || "").slice(0, 120),
          firstTouchCampaign: (input.attribution?.firstTouchCampaign || "").slice(0, 120),
          lastTouchSource: (input.attribution?.lastTouchSource || "").slice(0, 120),
          lastTouchMedium: (input.attribution?.lastTouchMedium || "").slice(0, 120),
          lastTouchCampaign: (input.attribution?.lastTouchCampaign || "").slice(0, 120),
          term: (input.attribution?.term || "").slice(0, 120),
          content: (input.attribution?.content || "").slice(0, 200),
          fbclid: (input.attribution?.fbclid || "").slice(0, 200),
          fbp: (input.attribution?.fbp || "").slice(0, 120),
          fbc: (input.attribution?.fbc || "").slice(0, 250),
        }),
        items: {
          create: quote.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            name: line.name,
            sku: line.sku,
            variantName: line.variantName,
            unitMinor: line.unitMinor,
            quantity: line.quantity,
            image: line.image,
          })),
        },
        payments: {
          create: { status: "PENDING", amountMinor: quote.totalMinor, currency: quote.currency },
        },
      },
      include: { items: true, payments: true },
    });
    logInfo("order_created", { order: created.number });
    createdId = created.id;
    await reserveInventory(created.id);
    if (input.userId) {
      await rememberCustomerDetails(input.userId, input.address);
      await prisma.cart.updateMany({
        where: { userId: input.userId, status: { in: ["ACTIVE", "ABANDONED"] } },
        data: { status: "CHECKOUT", checkoutStartedAt: new Date(), abandonedAt: null },
      });
    }
    const attached = await attachRazorpay(created);
    if (!attached.ok) await releaseInventory(created.id);
    return attached;
  } catch {
    const raced = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { items: true, payments: true },
    });
    if (raced && raced.paymentStatus === "PENDING" && raced.status === "PENDING_PAYMENT") return attachRazorpay(raced);
    if (createdId) await prisma.order.delete({ where: { id: createdId } }).catch(() => undefined);
    logError("order_created", { status: "failed" });
    return { ok: false as const, code: "ORDER_FAILED", message: "The order could not be created." };
  }
}

async function attachRazorpay(order: {
  id: string;
  number: string;
  currency: string;
  totalMinor: number;
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  razorpayOrderId: string;
  status: string;
  paymentStatus: string;
}) {
  if (order.razorpayOrderId || order.paymentStatus === "PAID") return presentOrder(order);
  const prisma = db();
  const razorpay = await createRazorpayOrder({
    amountMinor: order.totalMinor,
    currency: order.currency,
    receipt: order.number,
  });
  if (!razorpay.ok || !prisma) {
    return { ok: false as const, code: "PAYMENT_NOT_CONFIGURED", message: "Payment is temporarily unavailable. No charge was made.", orderId: order.id };
  }
  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: razorpay.id } });
  await prisma.payment.updateMany({ where: { orderId: order.id }, data: { razorpayOrderId: razorpay.id } });
  return presentOrder({ ...order, razorpayOrderId: razorpay.id });
}

function presentOrder(order: {
  id: string;
  number: string;
  currency: string;
  totalMinor: number;
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  razorpayOrderId: string;
  status: string;
  paymentStatus: string;
}) {
  return {
    ok: true as const,
    orderId: order.id,
    number: order.number,
    currency: order.currency,
    amountMinor: order.totalMinor,
    subtotal: fromMinor(order.subtotalMinor, order.currency),
    discount: fromMinor(order.discountMinor, order.currency),
    shipping: fromMinor(order.shippingMinor, order.currency),
    tax: fromMinor(order.taxMinor, order.currency),
    total: fromMinor(order.totalMinor, order.currency),
    razorpayOrderId: order.razorpayOrderId,
    status: order.status,
    paymentStatus: order.paymentStatus,
  };
}

export async function markOrderPaid(input: { razorpayOrderId: string; razorpayPaymentId: string; request?: Request }) {
  const prisma = db();
  if (!prisma) return { ok: false as const, code: "DATABASE_UNAVAILABLE" };
  const order = await prisma.order.findFirst({ where: { razorpayOrderId: input.razorpayOrderId }, include: { payments: true, items: true } });
  if (!order) return { ok: false as const, code: "ORDER_NOT_FOUND" };
  const purchase = purchasePayload(order);
  if (order.paymentStatus === "PAID") {
    return { ok: true as const, orderId: order.id, duplicate: true, purchase };
  }
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
      if (!current || current.paymentStatus === "PAID") return;
      const notes: string[] = [];
      for (const item of current.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product?.trackInventory) continue;
        const updated = item.variantId
          ? await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity }, reserved: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity }, reserved: { decrement: item.quantity } },
            })
          : await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity }, reserved: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity }, reserved: { decrement: item.quantity } },
            });
        if (updated.count !== 1) {
          const fallback = item.variantId
            ? await tx.productVariant.updateMany({
                where: { id: item.variantId, stock: { gte: item.quantity }, reserved: 0 },
                data: { stock: { decrement: item.quantity } },
              })
            : await tx.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity }, reserved: 0 },
                data: { stock: { decrement: item.quantity } },
              });
          if (fallback.count !== 1) notes.push(`${item.name} stock was not reduced.`);
        }
      }
      if (current.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: current.couponCode } });
        const already = await tx.couponUse.findFirst({ where: { orderId: current.id } });
        if (coupon && !already) {
          await tx.coupon.update({ where: { id: coupon.id }, data: { used: { increment: 1 } } });
          await tx.couponUse.create({ data: { couponId: coupon.id, email: current.email, userId: current.userId || "", orderId: current.id } });
        }
      }
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: current.status === "PENDING_PAYMENT" || current.status === "CANCELLED" ? "PAID" : current.status,
          internalNote: notes.length ? `${current.internalNote}\n${notes.join(" ")}`.trim() : current.internalNote,
        },
      });
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "PAID", razorpayPaymentId: input.razorpayPaymentId, razorpayOrderId: input.razorpayOrderId },
      });
      const payment = await tx.payment.findFirst({ where: { orderId: order.id } });
      if (payment) {
        await tx.paymentEvent.create({ data: { paymentId: payment.id, type: "captured", note: "Verified payment" } });
      }
    });
  } catch (error) {
    logError("payment_verification", { order: order.number });
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }).catch(() => undefined);
    throw error;
  }
  logInfo("payment_verification", { order: order.number, status: "PAID" });
  if (order.userId) {
    await prisma.cart.updateMany({
      where: { userId: order.userId, status: { in: ["ACTIVE", "CHECKOUT", "ABANDONED"] } },
      data: { status: "PURCHASED", abandonedAt: null },
    });
  }
  const paid = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
  if (paid?.paymentStatus !== "PAID") return { ok: false as const, code: "NOT_PAID" };
  {
    const confirmation = receiptFromOrder(paid, { title: "Order confirmed", note: "Thank you. Your payment was verified on the server." });
    await sendEmail({ to: paid.email, type: "order_confirmation", dedupeKey: `order_confirmation:${paid.id}`, ...confirmation });
    await sendEmail({
      to: paid.email,
      type: "payment_confirmation",
      dedupeKey: `payment_confirmation:${paid.id}`,
      ...receiptFromOrder(paid, { title: "Payment confirmed", note: "The payment reference is stored with your order. Card details are not included." }),
    });
    await sendOwnerEmail({
      type: "admin_paid_order",
      dedupeKey: `admin_paid_order:${paid.id}`,
      replyTo: paid.email,
      ...receiptFromOrder(paid, { title: "Paid order", note: "A payment was verified. Reply to this email to write to the customer. Fulfillment has not been assigned to a courier." }),
    });
    await sendVerifiedPurchase(paid, input.request);
  }
  return { ok: true as const, orderId: order.id, duplicate: false, purchase };
}

export async function markPaymentFailed(razorpayOrderId: string) {
  const prisma = db();
  if (!prisma || !razorpayOrderId) return;
  const order = await prisma.order.findFirst({ where: { razorpayOrderId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return;
  await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
  await prisma.payment.updateMany({ where: { orderId: order.id }, data: { status: "FAILED" } });
  await releaseInventory(order.id);
  const notice = receiptFromOrder({ ...order, paymentStatus: "FAILED" }, { title: "Payment was not completed", note: "Your bag is still saved. No successful charge was recorded." });
  await sendEmail({ to: order.email, type: "payment_failed", dedupeKey: `payment_failed:${order.id}`, ...notice });
  await sendOwnerEmail({ type: "admin_payment_failed", dedupeKey: `admin_payment_failed:${order.id}`, ...notice });
  await recordPaymentOutcome({ orderId: order.id, eventName: "PaymentFailed", eventId: `payment_failed_${order.id}` });
}

export async function markVerificationFailed(orderId: string) {
  const prisma = db();
  if (!prisma) return;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === "PAID") return;
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED", status: "PENDING_PAYMENT" } });
  await prisma.payment.updateMany({ where: { orderId }, data: { status: "FAILED" } });
  await releaseInventory(orderId);
  const payment = await prisma.payment.findFirst({ where: { orderId } });
  if (payment) await prisma.paymentEvent.create({ data: { paymentId: payment.id, type: "verification_failed" } });
  const { recordRisk } = await import("@/lib/fulfillment");
  await recordRisk(order.email, "failed_payment", "Repeated payment verification failures");
}

const fulfillmentEmail: Record<string, { type: string; title: string; note: string }> = {
  PROCESSING: { type: "order_processing", title: "Order processing", note: "Your order is being prepared." },
  PACKED: { type: "order_packed", title: "Order packed", note: "Your order has been packed." },
  SHIPPED: { type: "order_shipped", title: "Order shipped", note: "Your order has been marked shipped." },
  OUT_FOR_DELIVERY: { type: "order_out_for_delivery", title: "Out for delivery", note: "Your order was marked out for delivery." },
  DELIVERED: { type: "order_delivered", title: "Order delivered", note: "Your order has been marked delivered." },
  CANCELLED: { type: "order_cancelled", title: "Order cancelled", note: "Your order was cancelled." },
};

export async function abandonUnpaidOrder(orderId: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true } });
  if (!order || order.paymentStatus !== "PENDING" || order.status !== "PENDING_PAYMENT") {
    return { ok: true as const, abandoned: false };
  }
  if (order.payments.some((payment) => payment.razorpayPaymentId || payment.status === "PAID")) {
    return { ok: true as const, abandoned: false };
  }
  const updated = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "PENDING", status: "PENDING_PAYMENT" },
    data: { status: "CANCELLED", paymentStatus: "FAILED" },
  });
  if (updated.count !== 1) return { ok: true as const, abandoned: false };
  await releaseInventory(orderId);
  logInfo("payment_cancelled", { orderId });
  return { ok: true as const, abandoned: true };
}

export async function setFulfillmentStatus(orderId: string, status: string, note?: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const, message: "Database is not configured" };
  const allowed = ["PAID", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUND_PENDING", "REFUNDED", "FAILED_DELIVERY", "RETURN_TO_ORIGIN"];
  if (!allowed.includes(status)) return { ok: false as const, message: "That status is not available." };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { ok: false as const, message: "Order not found." };
  if (status !== "CANCELLED" && !paymentWasCaptured(order.paymentStatus)) {
    return { ok: false as const, message: "This order is not confirmed. Payment has not been completed." };
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status, internalNote: note ?? order.internalNote },
  });
  const mail = fulfillmentEmail[status];
  if (mail && order.status !== status && (status !== "CANCELLED" || paymentWasCaptured(order.paymentStatus))) {
    const current = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (current) {
      await sendEmail({
        to: current.email,
        type: mail.type,
        dedupeKey: `${mail.type}:${current.id}`,
        ...receiptFromOrder(current, { title: mail.title, note: mail.note, includeTracking: status === "SHIPPED" || status === "OUT_FOR_DELIVERY" }),
      });
    }
  }
  logInfo("order_status", { order: order.number, status });
  return { ok: true as const };
}

export async function requestRefund(orderId: string) {
  const prisma = db();
  if (!prisma) return { ok: false as const, message: "Database is not configured" };
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payments: true, items: true } });
  if (!order) return { ok: false as const, message: "Order not found." };
  const payment = order.payments.find((item) => item.razorpayPaymentId);
  if (!payment?.razorpayPaymentId) return { ok: false as const, message: "This order has no captured payment reference." };
  const refund = await createRazorpayRefund(payment.razorpayPaymentId, order.totalMinor);
  await prisma.refund.create({
    data: {
      orderId: order.id,
      paymentId: payment.id,
      amountMinor: order.totalMinor,
      reason: "Admin refund request",
      status: refund.ok ? "PROCESSING" : "FAILED",
      providerReference: refund.ok ? refund.id : "",
    },
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "REFUND_PENDING", paymentStatus: refund.ok ? "REFUND_PENDING" : order.paymentStatus },
  });
  await prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUND_PENDING" } });
  const refundNotice = receiptFromOrder(
    { ...order, paymentStatus: refund.ok ? "REFUND_PENDING" : order.paymentStatus },
    {
      title: "Refund initiated",
      note: refund.ok ? "A refund was requested with the payment provider." : "A refund was recorded here. The payment provider is not configured, so it was not sent.",
    },
  );
  await sendEmail({ to: order.email, type: "refund_initiated", dedupeKey: `refund_initiated:${order.id}`, ...refundNotice });
  await sendOwnerEmail({ type: "admin_refund_initiated", dedupeKey: `admin_refund_initiated:${order.id}`, ...refundNotice });
  return { ok: true as const, providerSent: refund.ok, message: refund.ok ? "Refund requested." : refund.error };
}

export async function markRefunded(razorpayPaymentId: string, partial: boolean) {
  const prisma = db();
  if (!prisma || !razorpayPaymentId) return;
  const payment = await prisma.payment.findFirst({ where: { razorpayPaymentId } });
  if (!payment) return;
  const status = partial ? "PARTIALLY_REFUNDED" : "REFUNDED";
  await prisma.payment.update({ where: { id: payment.id }, data: { status } });
  await prisma.refund.updateMany({ where: { orderId: payment.orderId, status: { in: ["PENDING", "PROCESSING"] } }, data: { status: partial ? "PROCESSING" : "COMPLETED" } });
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { paymentStatus: status, status: partial ? "REFUND_REQUESTED" : "REFUNDED" },
  });
  const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
  if (!order) return;
  const notice = receiptFromOrder(order, { title: "Refund update", note: "A refund status was updated from the payment provider." });
  await sendEmail({ to: order.email, type: "refund_completed", dedupeKey: `refund_completed:${order.id}:${status}`, ...notice });
  await sendOwnerEmail({ type: "admin_refund_completed", dedupeKey: `admin_refund_completed:${order.id}:${status}`, ...notice });
}

export function publicOrder(order: Prisma.OrderGetPayload<{ include: { items: true; payments: true } }>) {
  let address: AddressInput | null = null;
  try {
    address = JSON.parse(order.addressJson) as AddressInput;
  } catch {
    address = null;
  }
  const payment = order.payments[0];
  return {
    id: order.id,
    number: order.number,
    email: order.email,
    name: order.name,
    phone: order.phone,
    status: order.status,
    paymentStatus: order.paymentStatus,
    currency: order.currency,
    subtotal: fromMinor(order.subtotalMinor, order.currency),
    discount: fromMinor(order.discountMinor, order.currency),
    shipping: fromMinor(order.shippingMinor, order.currency),
    tax: fromMinor(order.taxMinor, order.currency),
    total: fromMinor(order.totalMinor, order.currency),
    couponCode: order.couponCode,
    address,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: payment?.razorpayPaymentId || "",
    shippingMethod: order.shippingMethod,
    courier: order.courier,
    shipmentId: order.shipmentId,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    deliveryEstimate: order.deliveryEstimate,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      sku: item.sku,
      variantName: item.variantName,
      unit: fromMinor(item.unitMinor, order.currency),
      quantity: item.quantity,
      image: item.image,
    })),
  };
}
