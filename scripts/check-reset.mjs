import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const product = await prisma.product.findUnique({ where: { slug: "rouge-sur-mesure" } });
const shipping = await prisma.siteSetting.findUnique({ where: { key: "shippingFlatMinor" } });
console.log(JSON.stringify({ price: product?.priceMinor, stock: product?.stock, track: product?.trackInventory, shipping: shipping?.value ?? null }));
await prisma.$disconnect();
