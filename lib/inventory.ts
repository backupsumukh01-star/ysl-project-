import { db } from "@/lib/db";

export async function reserveInventory(orderId: string) {
  const prisma = db();
  if (!prisma) return;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product?.trackInventory) continue;
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock - variant.reserved < item.quantity) throw new Error("OUT_OF_STOCK");
        await tx.productVariant.update({ where: { id: variant.id }, data: { reserved: { increment: item.quantity } } });
      } else {
        if (product.stock - product.reserved < item.quantity) throw new Error("OUT_OF_STOCK");
        await tx.product.update({ where: { id: product.id }, data: { reserved: { increment: item.quantity } } });
      }
    }
  });
}

export async function releaseInventory(orderId: string) {
  const prisma = db();
  if (!prisma) return;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.paymentStatus === "PAID") return;
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product?.trackInventory) continue;
      if (item.variantId) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId, reserved: { gte: item.quantity } },
          data: { reserved: { decrement: item.quantity } },
        });
      } else {
        await tx.product.updateMany({
          where: { id: item.productId, reserved: { gte: item.quantity } },
          data: { reserved: { decrement: item.quantity } },
        });
      }
    }
  });
}

export async function restoreSoldInventory(orderId: string) {
  const prisma = db();
  if (!prisma) return;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product?.trackInventory) continue;
      if (item.variantId) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      } else {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
  });
}
