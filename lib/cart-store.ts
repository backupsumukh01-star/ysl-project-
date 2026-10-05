import { db } from "@/lib/db";
import { minorToMajor } from "@/lib/crypto";
import { authoritativeMinor } from "@/lib/pricing";

export type SavedLine = {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  variantId: string;
  variantName: string;
  sku: string;
  price: number | null;
  image: string;
};

export async function readUserCart(userId: string): Promise<SavedLine[]> {
  const prisma = db();
  if (!prisma) return [];
  const cart = await prisma.cart.findFirst({ where: { userId }, include: { items: true } });
  if (!cart) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: cart.items.map((item) => item.productId) } },
    include: { images: { where: { active: true }, orderBy: { sortOrder: "asc" } }, variants: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));
  return cart.items.flatMap((item) => {
    const product = byId.get(item.productId);
    if (!product || !product.active) return [];
    const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : undefined;
    return [{
      id: product.id,
      slug: product.slug,
      name: product.name,
      quantity: item.quantity,
      variantId: variant?.id || "",
      variantName: variant?.name || storedSelection(item),
      sku: variant?.sku || product.sku,
      price: minorToMajor(authoritativeMinor(product.type, product.priceMinor)),
      image: product.images[0]?.src || "",
    }];
  });
}

type SavedInput = { productId: string; variantId?: string; quantity: number; selection?: string };

function storedSelection(line: { id: string }): string {
  const value = (line as { selection?: string }).selection;
  return value || "";
}

function savedKey(item: { productId: string; variantId: string; selection: string }) {
  return `${item.productId}:${item.variantId}:${item.selection}`;
}

export async function replaceUserCart(userId: string, items: SavedInput[]) {
  const prisma = db();
  if (!prisma) return [];
  let cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const merged = new Map<string, { productId: string; variantId: string; selection: string; quantity: number }>();
  for (const item of items) {
    const next = { productId: item.productId, variantId: item.variantId || "", selection: item.selection || "", quantity: item.quantity };
    const key = savedKey(next);
    const current = merged.get(key);
    merged.set(key, { ...next, quantity: Math.min(10, (current?.quantity || 0) + next.quantity) });
  }
  if (merged.size) {
    await prisma.cartItem.createMany({ data: [...merged.values()].map((item) => ({ cartId: cart.id, ...item })) });
  }
  return readUserCart(userId);
}

export async function mergeUserCart(userId: string, items: SavedInput[]) {
  const prisma = db();
  if (!prisma) return [];
  let cart = await prisma.cart.findFirst({ where: { userId }, include: { items: true } });
  if (!cart) cart = await prisma.cart.create({ data: { userId }, include: { items: true } });
  for (const item of items) {
    const variantId = item.variantId || "";
    const selection = item.selection || "";
    const existing = cart.items.find((line) => line.productId === item.productId && line.variantId === variantId && storedSelection(line) === selection);
    if (existing) {
      const quantity = Math.min(10, existing.quantity + item.quantity);
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
      existing.quantity = quantity;
    } else {
      const created = await prisma.cartItem.create({
        data: { cartId: cart.id, productId: item.productId, variantId, selection, quantity: Math.min(10, item.quantity) },
      });
      cart.items.push(created);
    }
  }
  return readUserCart(userId);
}
