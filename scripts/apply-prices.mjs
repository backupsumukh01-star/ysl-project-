import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prices = JSON.parse(readFileSync(new URL("../lib/catalog-prices.json", import.meta.url), "utf8"));
const minor = {
  DEVICE: Math.round(prices.device * 100),
  CARTRIDGE_TRIO: Math.round(prices.cartridgeTrio * 100),
  REFILL: Math.round(prices.refill * 100),
  BUNDLE: Math.round(prices.bundle * 100),
};

const prisma = new PrismaClient();

for (const [type, priceMinor] of Object.entries(minor)) {
  const result = await prisma.product.updateMany({ where: { type }, data: { priceMinor } });
  console.log(`${type} ${result.count}`);
}

await prisma.siteSetting.upsert({
  where: { key: "currency" },
  update: { value: prices.currency },
  create: { key: "currency", value: prices.currency },
});

console.log("currency updated");
await prisma.$disconnect();
