import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";
import { appRequirement, cartridges, families, faqs, ingredients, refillVariants, trios } from "./catalog-facts.mjs";

const publishedPrices = JSON.parse(readFileSync(new URL("../lib/catalog-prices.json", import.meta.url), "utf8"));

function priceMinorFor(type) {
  const inr = publishedPrices.inr;
  if (type === "DEVICE") return inr.device * 100;
  if (type === "CARTRIDGE_TRIO") return inr.cartridgeTrio * 100;
  if (type === "REFILL") return inr.refill * 100;
  if (type === "BUNDLE") return inr.bundle * 100;
  return null;
}

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

const categories = [
  { slug: "device", name: "Device" },
  { slug: "trios", name: "Cartridge trios" },
  { slug: "refills", name: "Refills" },
  { slug: "bundles", name: "Bundles" },
];

const products = [
  {
    slug: "rouge-sur-mesure",
    name: "Rouge Sur Mesure",
    shortDescription: "Custom lip color creator. Includes 3 complimentary cartridge sets — 9 cartridges total.",
    description:
      "Rouge Sur Mesure is a custom lip color creator. The device, a supported cartridge trio, and the official companion app are used together. This purchase includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional cartridge trios and refills are available separately.",
    sku: "RSM-DEVICE",
    type: "DEVICE",
    category: "device",
    featured: true,
    sortOrder: 0,
    included:
      "Rouge Sur Mesure device. 3 complimentary cartridge sets. 9 cartridges total. Retractable lip brush. The names of those three sets are not listed until they are configured. Additional cartridge trios and refills are available separately.",
    compatibility: "Only the seven published trios work. Cartridges cannot be blended outside those trios.",
    details: "App requirements on the device and bundle pages: iOS 13 or later on iPhone 6S or newer, Android 8.0 or later, Bluetooth 4.2. Official pages do not share one shade count. The device description says thousands of custom shades. The refill description says 1,300 new shades with each family. The trio page lists 1,300+ colors as a keyword.",
    tags: "rouge sur mesure,custom lip color creator,custom lipstick creator,custom lip color,device,app",
    seoTitle: "Rouge Sur Mesure custom lip color creator",
    seoDescription: "The Rouge Sur Mesure device includes 3 complimentary cartridge sets — 9 cartridges total — and a retractable lip brush. Additional trios and refills are separate products.",
    images: [
      ["/images/hero.png", "Matte-black Rouge Sur Mesure device with a quilted gold-rimmed lid."],
      ["/images/showcase.png", "Three-quarter view of the closed device."],
      ["/images/macro.png", "Close view of the quilted lid and gold monogram."],
      ["/images/packaging.png", "The device in its black presentation box."],
    ],
  },
  ...trios.map((trio, index) => ({
    slug: trio.slug,
    name: `Cartridge Trio — ${trio.name}`,
    shortDescription: `Supported trio ${trio.codes.replaceAll(",", ", ")}. For the Rouge Sur Mesure device.`,
    description: `${trio.name} is one of the seven supported cartridge trios. It contains ${trio.codes.replaceAll(",", ", ")}. The official pages say colors are produced only inside these trio formats.`,
    sku: `RSM-TRIO-${trio.name.toUpperCase().replaceAll(" ", "-")}`,
    type: "CARTRIDGE_TRIO",
    category: "trios",
    sortOrder: index + 1,
    included: trio.codes.replaceAll(",", ", "),
    compatibility: "For the Rouge Sur Mesure device. Do not combine these cartridges with a different trio.",
    details: families.find((family) => family.slug === trio.family)?.summary || "",
    tags: `cartridge,cartridge trio,${trio.name},${trio.codes}`,
    seoTitle: `${trio.name} cartridge trio ${trio.codes.replaceAll(",", " ")}`,
    seoDescription: `${trio.name} is a supported Rouge Sur Mesure cartridge trio: ${trio.codes.replaceAll(",", ", ")}.`,
    images: [["/images/swatches.png", "Color reference. This is not an official shade swatch for this trio."]],
  })),
  {
    slug: "cartridge-refill",
    name: "Cartridge refill",
    shortDescription: "A single cartridge for restocking an existing Rouge Sur Mesure setup.",
    description:
      "A single cartridge refills a shade you already use in Rouge Sur Mesure. All 12 cartridges are sold individually: Orange O1 O2 O3, Pink P1 P2 P3, Red R1 R2 R3, and Nude N1 N2 N3. The device still only works with the seven supported trios. The app can warn when formula is low. A spent cartridge is released by pressing the black button near the opening under the device.",
    sku: "RSM-REFILL",
    type: "REFILL",
    category: "refills",
    sortOrder: 20,
    included: refillVariants.map((item) => item.name).join("; "),
    compatibility: "Restocks a cartridge inside a supported trio. It does not create a new trio.",
    details: "Sold individually: O1 Coral, O2 Medium Orange, O3 Deep Orange, P1 Rosy Pink, P2 Vivid Pink, P3 Plum, R1 Scarlet, R2 Cherry, R3 Deep Red, N1 Warm Beige, N2 Medium Nude, N3 Deep Nude.",
    tags: "refill,cartridge,O1,O2,O3,P1,P2,P3,R1,R2,R3,N1,N2,N3,red,orange,pink,nude",
    seoTitle: "Rouge Sur Mesure cartridge refill",
    seoDescription: "All 12 Rouge Sur Mesure cartridges are sold individually. A refill restocks one cartridge and does not create a new trio.",
    images: [["/images/swatches.png", "Color reference for refill cartridges."]],
    variants: refillVariants,
  },
  {
    slug: "rouge-sur-mesure-bundle",
    name: "Rouge Sur Mesure bundle",
    shortDescription: "The device plus one supported cartridge trio.",
    description:
      "The bundle is the Rouge Sur Mesure lip color creator plus one cartridge trio of your choice. The official listing also labels the set as 4 products.",
    sku: "RSM-BUNDLE",
    type: "BUNDLE",
    category: "bundles",
    sortOrder: 30,
    included: "Device and one of the seven supported trios.",
    compatibility: "The trio you choose is the only cartridge combination in the bundle.",
    details: "Price is set on this shop. It is not taken from the official US listing.",
    tags: "bundle,device,cartridge trio,rouge sur mesure",
    seoTitle: "Rouge Sur Mesure device and cartridge trio",
    seoDescription: "A bundle of the Rouge Sur Mesure device and one supported cartridge trio. Price is set on this shop.",
    images: [["/images/packaging.png", "The device in its black presentation box."]],
    variants: trios.map((trio) => ({ code: trio.codes, name: `${trio.name} — ${trio.codes.replaceAll(",", " ")}` })),
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  const saved = [];
  for (const item of products) {
    const category = await prisma.category.findUnique({ where: { slug: item.category } });
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        sku: item.sku,
        type: item.type,
        categoryId: category?.id,
        featured: Boolean(item.featured),
        sortOrder: item.sortOrder,
        included: item.included || "",
        compatibility: item.compatibility || "Compatibility has not been confirmed.",
        details: item.details || "",
        tags: item.tags || "",
        seoTitle: item.seoTitle || "",
        seoDescription: item.seoDescription || "",
        shippingNote: "Shipping calculated at checkout.",
        priceMinor: priceMinorFor(item.type),
      },
      create: {
        slug: item.slug,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        sku: item.sku,
        type: item.type,
        categoryId: category?.id,
        featured: Boolean(item.featured),
        sortOrder: item.sortOrder,
        priceMinor: priceMinorFor(item.type),
        included: item.included || "",
        compatibility: item.compatibility || "Compatibility has not been confirmed.",
        details: item.details || "",
        tags: item.tags || "",
        seoTitle: item.seoTitle || "",
        seoDescription: item.seoDescription || "",
        shippingNote: "Shipping calculated at checkout.",
        availability: "Availability is confirmed with your order.",
      },
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: item.images.map(([src, alt], index) => ({
        productId: product.id,
        src,
        alt,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
    if (item.variants) {
      await prisma.productVariant.deleteMany({ where: { productId: product.id } });
      await prisma.productVariant.createMany({
        data: item.variants.map((variant) => ({ productId: product.id, name: variant.name, sku: `${item.sku}-${variant.code}`, active: true })),
      });
    }
    saved.push(product);
  }
  await prisma.product.updateMany({ where: { slug: "accessory-to-be-confirmed" }, data: { active: false } });
  const device = saved.find((item) => item.slug === "rouge-sur-mesure");
  const others = saved.filter((item) => item.id !== device?.id);
  if (device) {
    await prisma.relatedProduct.deleteMany({ where: { productId: device.id } });
    await prisma.relatedProduct.createMany({
      data: others.map((item) => ({ productId: device.id, relatedId: item.id, kind: item.type === "BUNDLE" ? "bundle" : item.type === "REFILL" ? "refill" : "trio" })),
    });
  }
  const refillProduct = saved.find((item) => item.slug === "cartridge-refill");
  const individual = new Set(refillVariants.map((item) => item.code));
  for (const trio of trios) {
    const product = saved.find((item) => item.slug === trio.slug);
    if (!product) continue;
    const links = [];
    if (device) links.push({ productId: product.id, relatedId: device.id, kind: "device" });
    if (refillProduct && trio.codes.split(",").some((code) => individual.has(code))) {
      links.push({ productId: product.id, relatedId: refillProduct.id, kind: "refill" });
    }
    await prisma.relatedProduct.deleteMany({ where: { productId: product.id } });
    if (links.length) await prisma.relatedProduct.createMany({ data: links });
  }
  for (const family of families) {
    await prisma.cartridgeFamily.upsert({
      where: { slug: family.slug },
      update: { name: family.name, summary: family.summary, sortOrder: family.sortOrder },
      create: family,
    });
  }
  for (const cartridge of cartridges) {
    const family = await prisma.cartridgeFamily.findUnique({ where: { slug: cartridge.family } });
    if (!family) continue;
    await prisma.cartridge.upsert({
      where: { code: cartridge.code },
      update: { name: cartridge.name, familyId: family.id, soldIndividually: cartridge.soldIndividually, ingredients: ingredients[cartridge.code] || "" },
      create: { code: cartridge.code, name: cartridge.name, familyId: family.id, soldIndividually: cartridge.soldIndividually, ingredients: ingredients[cartridge.code] || "" },
    });
  }
  for (const trio of trios) {
    const family = await prisma.cartridgeFamily.findUnique({ where: { slug: trio.family } });
    const product = saved.find((item) => item.slug === trio.slug);
    if (!family) continue;
    await prisma.cartridgeTrio.upsert({
      where: { slug: trio.slug },
      update: { name: trio.name, codes: trio.codes, familyId: family.id, productId: product?.id, summary: family.summary },
      create: { slug: trio.slug, name: trio.name, codes: trio.codes, familyId: family.id, productId: product?.id, summary: family.summary },
    });
  }
  await prisma.appRequirement.upsert({
    where: { id: "default" },
    update: appRequirement,
    create: { id: "default", ...appRequirement },
  });
  await prisma.productFaq.deleteMany({ where: { scope: "global" } });
  await prisma.productFaq.createMany({ data: faqs.map((faq, index) => ({ ...faq, scope: "global", sortOrder: index })) });
  const settings = {
    heroKicker: "Custom Lip Color Creator",
    heroTitle: "Your lip color.\nCreated your way.",
    heroSubtitle: "A luxury custom lip color experience designed to help you discover and create a shade that feels uniquely yours.",
    heroPrimary: "Shop now",
    heroSecondary: "See how it works",
    announcement: "",
    sellerName: "Rouge Beauty",
    shippingEnabled: "true",
    shippingFlatMinor: "0",
    shippingMessage: "Shipping is included in the product price. There is no separate shipping charge.",
    returnsMessage: "An order cannot be cancelled after it is placed. Replacement and refund rules are on the Terms page.",
    supportEmail: (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "").includes("@example.") ? "" : process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
    reviewsPublicWithoutModeration: "false",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (adminEmail && adminPassword.length >= 8) {
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash: hashPassword(adminPassword) },
      create: { email: adminEmail, passwordHash: hashPassword(adminPassword) },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
